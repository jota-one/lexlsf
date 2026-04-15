<template>
  <div class="space-y-4">
    <!-- Expression -->
    <div class="flex items-start gap-4">
      <label for="fe-expr" class="font-semibold w-60 pt-2">Expression</label>
      <textarea
        v-model="form.expression"
        id="fe-expr"
        class="textarea textarea-bordered w-full"
        rows="2"
        placeholder="Ex: Il l'a vraiment fait par dessus la jambe"
        required
      ></textarea>
    </div>

    <!-- Slug -->
    <div class="flex items-center gap-4">
      <label for="fe-slug" class="font-semibold w-60">Slug</label>
      <div class="flex gap-2 w-full">
        <InputText
          v-model="form.slug"
          id="fe-slug"
          class="flex-1"
          placeholder="Auto-généré depuis l'expression"
        />
        <Button
          icon="i-fa6-solid-arrows-rotate"
          severity="secondary"
          size="small"
          @click="regenerateSlug"
          v-tooltip="'Régénérer depuis l\'expression'"
        />
      </div>
    </div>

    <!-- Stratégies -->
    <div class="flex items-start gap-4">
      <label for="fe-strategies" class="font-semibold w-60 pt-2">Stratégies</label>
      <textarea
        v-model="form.strategies"
        id="fe-strategies"
        class="textarea textarea-bordered w-full"
        rows="4"
        placeholder="Comment signer cette expression..."
      ></textarea>
    </div>

    <!-- Signes liés -->
    <div class="flex items-start gap-4">
      <label class="font-semibold w-60 pt-2">Signes utiles</label>
      <div class="w-full">
        <SignPicker mode="multi" v-model="form.Signs" />
      </div>
    </div>

    <!-- Visible pour (rôles) -->
    <div class="flex items-center gap-4">
      <label class="font-semibold w-60">Visible pour</label>
      <div class="flex flex-wrap gap-2 w-full">
        <span v-if="rolesLoading" class="loading loading-spinner loading-sm"></span>
        <template v-else>
          <button
            v-for="role in roles"
            :key="role.id"
            type="button"
            class="badge badge-md"
            :class="roleBadgeClass(role)"
            :title="role.slug === 'admin' ? 'Toujours autorisé (automatique)' : ''"
            @click="toggleRole(role)"
          >
            {{ role.name }}
            <span v-if="role.slug === 'admin'" class="ml-1 i-fa6-solid-lock text-xs"></span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import useRoles from '../composables/useRoles'
import type { TFrenchExpression } from '../../types'
import SignPicker from './SignPicker.vue'
import { createSlug } from '@admin/helpers/strings'

const form = defineModel<TFrenchExpression.TForm>({ required: true })

const { roles, loadRoles } = useRoles()
const rolesLoading = ref(false)

const adminRoleId = ref('')
watch(roles, () => {
  adminRoleId.value = roles.value.find(r => r.slug === 'admin')?.id || ''
  if (!adminRoleId.value || !Array.isArray(form.value.Roles)) return
  form.value.Roles = form.value.Roles.filter(id => id !== adminRoleId.value)
})

const isRoleSelected = (roleId: string) => {
  if (!roleId) return false
  if (roleId === adminRoleId.value) return true
  return (form.value.Roles || []).includes(roleId)
}

const toggleRole = (role: { id: string; slug: string }) => {
  if (role.slug === 'admin') return
  if ((form.value.Roles || []).includes(role.id)) {
    form.value.Roles = (form.value.Roles || []).filter(id => id !== role.id)
    return
  }
  form.value.Roles = [...(form.value.Roles || []), role.id]
}

const roleBadgeClass = (role: { id: string; slug: string }) => {
  if (role.slug === 'admin') return 'badge-primary opacity-60 cursor-not-allowed'
  return isRoleSelected(role.id) ? 'badge-primary cursor-pointer' : 'cursor-pointer'
}

const regenerateSlug = () => {
  if (form.value.expression) {
    form.value.slug = createSlug(form.value.expression)
  }
}

watch(() => form.value.expression, (val) => {
  if (!form.value.slug && val) {
    form.value.slug = createSlug(val)
  }
})

onMounted(() => {
  rolesLoading.value = true
  loadRoles().finally(() => {
    rolesLoading.value = false
  })
})
</script>
