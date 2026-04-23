<template>
  <Tabs v-model:value="activeTab" class="w-full">
    <TabList>
      <Tab :value="0">Informations</Tab>
      <Tab :value="1">Termes</Tab>
      <Tab :value="2">Catégories</Tab>
    </TabList>

    <TabPanels>
      <!-- Onglet Informations -->
      <TabPanel :value="0" class="space-y-4">
        <!-- Nom -->
        <div class="flex items-center gap-4">
          <label for="lf-name" class="font-semibold w-60">Nom</label>
          <InputText v-model="form.name" id="lf-name" class="w-full" required />
        </div>

        <!-- Slug -->
        <div class="flex items-center gap-4">
          <label for="lf-slug" class="font-semibold w-60">Slug</label>
          <div class="flex gap-2 w-full">
            <InputText
              v-model="form.slug"
              id="lf-slug"
              class="flex-1"
              placeholder="Auto-généré depuis le nom"
            />
            <Button
              icon="i-fa6-solid-arrows-rotate"
              severity="secondary"
              size="small"
              @click="regenerateSlug"
              v-tooltip="'Régénérer depuis le nom'"
            />
          </div>
        </div>

        <!-- Introduction -->
        <div class="flex items-start gap-4">
          <label for="lf-intro" class="font-semibold w-60 pt-2">Introduction</label>
          <textarea
            v-model="form.introduction"
            id="lf-intro"
            class="textarea textarea-bordered w-full"
            rows="3"
            placeholder="Courte description du champ lexical..."
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
      </TabPanel>

      <!-- Onglet Termes -->
      <TabPanel :value="1" class="space-y-3">
        <div
          v-for="(termItem, index) in terms"
          :key="index"
          class="p-4 border border-base-300 rounded-lg space-y-3"
        >
          <div class="flex items-start gap-2">
            <div class="flex-1 space-y-3">
              <!-- Terme -->
              <InputText
                v-model="termItem.term"
                class="w-full"
                placeholder="Terme français..."
              />

              <!-- Est une personne -->
              <div class="flex items-center gap-3">
                <ToggleSwitch v-model="termItem.is_person" :inputId="`term-is-person-${index}`" />
                <label :for="`term-is-person-${index}`" class="text-sm cursor-pointer">
                  Ce terme est une personne
                </label>
              </div>

              <!-- Stratégie (toujours visible) -->
              <div>
                <p class="text-xs text-base-content/50 mb-1">Stratégie (optionnel)</p>
                <textarea
                  v-model="termItem.strategy"
                  class="textarea textarea-bordered w-full text-sm"
                  rows="2"
                  placeholder="Stratégie..."
                ></textarea>
              </div>

              <!-- Signe associé (toujours visible) -->
              <div>
                <p class="text-xs text-base-content/50 mb-1">Signe associé (optionnel)</p>
                <SignPicker mode="single" v-model="termItem.Sign" />
              </div>

              <!-- Champs spécifiques personne -->
              <template v-if="termItem.is_person">
                <div>
                  <p class="text-xs text-base-content/50 mb-1">Description (markdown)</p>
                  <textarea
                    v-model="termItem.description"
                    class="textarea textarea-bordered w-full text-sm"
                    rows="4"
                    placeholder="Description de la personne..."
                  ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <p class="text-xs text-base-content/50 mb-1">Début d'activité</p>
                    <InputText
                      v-model="termItem.start_date"
                      type="date"
                      class="w-full text-sm"
                    />
                  </div>
                  <div>
                    <p class="text-xs text-base-content/50 mb-1">Fin d'activité</p>
                    <InputText
                      v-model="termItem.end_date"
                      type="date"
                      class="w-full text-sm"
                    />
                  </div>
                </div>

                <div>
                  <p class="text-xs text-base-content/50 mb-1">Personne liée dans Culture (optionnel)</p>
                  <PersonPicker v-model="termItem.Person" />
                </div>
              </template>
            </div>

            <button
              type="button"
              class="btn btn-square btn-sm btn-error btn-outline mt-1 shrink-0"
              @click="removeTerm(index)"
            >
              <span class="i-fa-solid-times"></span>
            </button>
          </div>
        </div>

        <button type="button" class="btn btn-sm btn-outline" @click="addTerm">
          <span class="i-fa-solid-plus"></span>
          Ajouter un terme
        </button>
      </TabPanel>

      <!-- Onglet Catégories -->
      <TabPanel :value="2">
        <CategoriesPickerForm
          v-model="selectedCategories"
          entity="lexical_field"
        />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import ToggleSwitch from 'primevue/toggleswitch'
import useRoles from '../composables/useRoles'
import useCategories from '../composables/useCategories'
import type { TLexicalField } from '../../types'
import SignPicker from './SignPicker.vue'
import PersonPicker from './PersonPicker.vue'
import CategoriesPickerForm from './CategoriesPickerForm.vue'
import { createSlug } from '@admin/helpers/strings'

export type LocalTerm = {
  id?: string
  term: string
  Sign?: string
  is_person?: boolean
  description?: string
  strategy?: string
  start_date?: string
  end_date?: string
  Person?: string
}

const form = defineModel<TLexicalField.TForm>({ required: true })
const terms = defineModel<LocalTerm[]>('terms', { required: true })

const activeTab = ref(0)
const { roles, loadRoles } = useRoles()
const { categories, loadCategories } = useCategories()
const rolesLoading = ref(false)

// selectedCategories: { [parentId]: childId[] }
const selectedCategories = ref<{ [parentId: string]: string[] }>({})
const categoriesInitialized = ref(false)

// When categories load, initialize selectedCategories from form.Categories (edit mode)
watch([categories, () => form.value.Categories], () => {
  if (categoriesInitialized.value) return
  if (!categories.value.length) return
  categoriesInitialized.value = true
  const flatIds = form.value.Categories || []
  const result: { [parentId: string]: string[] } = {}
  for (const parent of categories.value.filter((c: any) => !c.Parent)) {
    const children = (parent.expand?.category_via_Parent || []) as any[]
    result[parent.id] = children.filter((c: any) => flatIds.includes(c.id)).map((c: any) => c.id)
  }
  selectedCategories.value = result
}, { immediate: true })

// Sync selectedCategories → form.Categories
watch(selectedCategories, (val) => {
  if (!categoriesInitialized.value) return
  form.value.Categories = Object.values(val).flat()
}, { deep: true })

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
  if (form.value.name) {
    form.value.slug = createSlug(form.value.name)
  }
}

watch(() => form.value.name, (val) => {
  if (!form.value.slug && val) {
    form.value.slug = createSlug(val)
  }
})

const addTerm = () => {
  terms.value = [...terms.value, { term: '', Sign: '', is_person: false }]
}

const removeTerm = (index: number) => {
  terms.value = terms.value.filter((_, i) => i !== index)
}

onMounted(() => {
  rolesLoading.value = true
  loadRoles().finally(() => (rolesLoading.value = false))
  loadCategories('lexical_field')
})
</script>
