<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import QuizForm from '@admin/components/QuizForm.vue'
import QuizItemSearch from '@admin/components/QuizItemSearch.vue'
import QuizItemsList from '@admin/components/QuizItemsList.vue'
import useQuizzes from '@admin/composables/useQuizzes'
import usePbErrorToast from '@admin/composables/usePbErrorToast'

const route = useRoute()
const router = useRouter()
const { loadQuiz, updateQuiz, addQuizItems } = useQuizzes()
const { showPbError } = usePbErrorToast()

const quizId = computed(() => route.params.id as string)
const loading = ref(false)
const saving = ref(false)
const activeTab = ref('0')

const form = ref({
  title: '',
  description: '',
  item_type: 'sign' as 'sign' | 'person' | 'mixed',
})

// Track items for refresh
const itemsRefreshKey = ref(0)
const existingItemKeys = ref<string[]>([])

onMounted(async () => {
  loading.value = true
  try {
    const { quiz } = await loadQuiz(quizId.value)
    form.value = {
      title: quiz.title,
      description: quiz.description || '',
      item_type: quiz.item_type,
    }
  } catch (error) {
    showPbError(error)
  } finally {
    loading.value = false
  }
})

const saveQuiz = async () => {
  if (!form.value.title.trim()) {
    alert('Le titre est obligatoire')
    return
  }

  saving.value = true
  try {
    await updateQuiz(quizId.value, {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      settings: {},
    })
    router.push('/quizzes')
  } catch (error) {
    showPbError(error)
  } finally {
    saving.value = false
  }
}

const cancel = () => {
  router.push('/quizzes')
}

const handleItemSelected = async (item: any) => {
  try {
    await addQuizItems(quizId.value, [
      {
        item_type: item.type,
        item_id: item.id,
      },
    ])
    // Refresh items list
    itemsRefreshKey.value++
  } catch (error) {
    showPbError(error)
  }
}

const handleItemsSelectedAll = async (items: any[]) => {
  try {
    await addQuizItems(
      quizId.value,
      items.map((item) => ({
        item_type: item.type,
        item_id: item.id,
      }))
    )
    // Refresh items list
    itemsRefreshKey.value++
  } catch (error) {
    showPbError(error)
  }
}

const handleItemsRefresh = () => {
  itemsRefreshKey.value++
}

const handleItemsLoaded = (keys: string[]) => {
  existingItemKeys.value = keys
}
</script>

<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">Éditer le quiz</h2>
    </div>

    <div v-if="loading" class="card p-6 text-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else class="card">
      <Tabs v-model:value="activeTab" class="w-full">
        <TabList>
          <Tab value="0">Détails du quiz</Tab>
          <Tab value="1">Éléments du quiz</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <div class="p-6">
              <QuizForm v-model="form" :is-edit-mode="true" :loading="saving" />
              <div class="flex justify-end gap-2 mt-6">
                <button type="button" class="btn btn-ghost btn-sm" @click="cancel">Annuler</button>
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  :disabled="loading || saving"
                  @click="saveQuiz"
                >
                  <span v-if="saving" class="loading loading-spinner loading-sm"></span>
                  Mettre à jour
                </button>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="1">
            <div class="p-6 space-y-6">
              <!-- Current Items -->
              <div>
                <h3 class="text-lg font-semibold mb-4">Éléments actuels</h3>
                <QuizItemsList
                  :key="itemsRefreshKey"
                  :quiz-id="quizId"
                  :item-type="form.item_type"
                  @delete="handleItemsRefresh"
                  @loaded="handleItemsLoaded"
                />
              </div>

              <!-- Divider -->
              <div class="divider"></div>

              <!-- Search & Add -->
              <div>
                <h3 class="text-lg font-semibold mb-4">Ajouter des éléments</h3>
                <QuizItemSearch
                  :item-type="form.item_type"
                  :exclude-keys="existingItemKeys"
                  @select="handleItemSelected"
                  @select-all="handleItemsSelectedAll"
                />
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>
