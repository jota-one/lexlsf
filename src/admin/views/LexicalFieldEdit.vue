<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <RouterLink
          to="/lexical-fields"
          class="text-sm text-base-content/50 hover:text-base-content mb-1 inline-block"
        >
          ← Champs lexicaux
        </RouterLink>
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <span class="i-fa6-solid-book-open"></span>
          {{ form.name || 'Champ lexical' }}
        </h2>
      </div>
    </div>

    <div v-if="loading" class="card p-6 text-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else class="card">
      <Tabs v-model:value="activeTab" class="w-full">
        <TabList>
          <Tab value="0">Informations</Tab>
          <Tab value="1">Termes</Tab>
          <Tab value="2">Catégories</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <div class="p-6">
              <LexicalFieldForm v-model="form" />
              <div class="flex justify-end gap-2 mt-6">
                <button type="button" class="btn btn-ghost btn-sm" @click="cancel">Annuler</button>
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  :disabled="saving"
                  @click="save"
                >
                  <span v-if="saving" class="loading loading-spinner loading-sm"></span>
                  Enregistrer
                </button>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="1">
            <div class="p-6">
              <LexicalTermsPanel :field-id="fieldId" />
            </div>
          </TabPanel>

          <TabPanel value="2">
            <div class="p-6">
              <LexicalFieldCategoriesForm v-model="form.Categories" />
              <div class="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  :disabled="saving"
                  @click="save"
                >
                  <span v-if="saving" class="loading loading-spinner loading-sm"></span>
                  Enregistrer
                </button>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <PbErrorToast />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import LexicalFieldForm from '@admin/components/LexicalFieldForm.vue'
import LexicalFieldCategoriesForm from '@admin/components/LexicalFieldCategoriesForm.vue'
import LexicalTermsPanel from '@admin/components/LexicalTermsPanel.vue'
import PbErrorToast from '@admin/components/PbErrorToast.vue'
import useLexicalFields from '@admin/composables/useLexicalFields'
import usePbErrorToast from '@admin/composables/usePbErrorToast'
import type { TLexicalField } from '../../types'

const route = useRoute()
const router = useRouter()
const { loadLexicalField, updateLexicalField } = useLexicalFields()
const { showPbError } = usePbErrorToast()

const fieldId = computed(() => route.params.id as string)
const loading = ref(false)
const saving = ref(false)
const activeTab = ref('0')

const form = ref<TLexicalField.TForm>({
  name: '',
  introduction: '',
  Roles: [],
  Categories: [],
})

onMounted(async () => {
  loading.value = true
  try {
    const field = await loadLexicalField(fieldId.value)
    form.value = {
      id: field.id,
      name: field.name,
      slug: field.slug,
      introduction: field.introduction || '',
      Roles: field.Roles || [],
      Categories: field.Categories || [],
    }
  } catch (error) {
    showPbError(error)
  } finally {
    loading.value = false
  }
})

const save = async () => {
  if (!form.value.name.trim()) {
    return
  }
  saving.value = true
  try {
    await updateLexicalField(fieldId.value, form.value)
    router.push('/lexical-fields')
  } catch (error) {
    showPbError(error)
  } finally {
    saving.value = false
  }
}

const cancel = () => {
  router.push('/lexical-fields')
}
</script>
