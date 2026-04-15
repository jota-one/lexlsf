<template>
  <div class="space-y-4">
    <!-- Signe associé (obligatoire) -->
    <div class="flex items-start gap-4">
      <label class="font-semibold w-60 pt-2">
        Signe associé <span class="text-error">*</span>
      </label>
      <div class="w-full">
        <SignPicker mode="single" v-model="form.Sign" />
      </div>
    </div>

    <!-- Stratégies -->
    <div class="flex items-start gap-4">
      <label for="pde-strategies" class="font-semibold w-60 pt-2">Stratégies</label>
      <textarea
        v-model="form.strategies"
        id="pde-strategies"
        class="textarea textarea-bordered w-full"
        rows="4"
        placeholder="Comment retranscrire cette expression en français..."
      ></textarea>
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
import useRoles from '../composables/useRoles'
import type { TPiDeafExpression } from '../../types'
import SignPicker from './SignPicker.vue'

const form = defineModel<TPiDeafExpression.TForm>({ required: true })

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

onMounted(() => {
  rolesLoading.value = true
  loadRoles().finally(() => {
    rolesLoading.value = false
  })
})
</script>
