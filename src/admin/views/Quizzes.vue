<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import dayjs from 'dayjs'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import useQuizzes from '@admin/composables/useQuizzes'
import usePbErrorToast from '@admin/composables/usePbErrorToast'
import ConfirmModal from '@admin/components/ConfirmModal.vue'
import QuizAddModal from '@admin/components/QuizAddModal.vue'
import PbErrorToast from '@admin/components/PbErrorToast.vue'
import type { QuizRecord } from '@admin/composables/useQuizzes'

const { quizzes, loading, loadQuizzes, deleteQuiz, quizItemCounts } = useQuizzes()
const { showPbError } = usePbErrorToast()

const showAddModal = ref(false)
const showDeleteModal = ref(false)
const quizToDelete = ref<QuizRecord | null>(null)
const deleteMessage = ref('')

onMounted(() => {
  loadQuizzes()
})

const itemTypeLabel = (itemType: string) => {
  const labels: Record<string, string> = {
    sign: 'Signes',
    person: 'Personnes',
    mixed: 'Mixte',
  }
  return labels[itemType] || itemType
}

const openDeleteConfirm = (quiz: QuizRecord) => {
  quizToDelete.value = quiz
  deleteMessage.value = `Êtes-vous sûr de vouloir supprimer le quiz "${quiz.title}" ? Cela supprimera également tous les éléments du quiz.`
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!quizToDelete.value) return

  try {
    await deleteQuiz(quizToDelete.value.id)
    await loadQuizzes()
  } catch (error) {
    const backendMessage = error?.response?.message || error?.message || ''
    const isRelationBlocked =
      backendMessage.includes('required relation reference') ||
      backendMessage.includes('Failed to delete record')

    // Si PocketBase bloque la suppression à cause de relations obligatoires, afficher un message clair
    if (isRelationBlocked) {
      showPbError(
        "Suppression impossible : ce quiz a encore des sessions ou tentatives associées. Supprime d'abord les sessions liées avant de retirer le quiz."
      )
      return
    }

    showPbError(error)
  } finally {
    showDeleteModal.value = false
    quizToDelete.value = null
  }
}

const handleQuizSaved = async () => {
  await loadQuizzes()
}
</script>

<template>
  <div class="p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">Quiz</h2>
      <button type="button" class="btn btn-primary btn-sm" @click="showAddModal = true">
        <span class="i-fa-solid-plus"></span>
        Nouveau quiz
      </button>
    </div>

    <!-- Data Table -->
    <div class="card">
      <DataTable
        :value="quizzes"
        :loading="loading"
        responsiveLayout="scroll"
        stripedRows
        dataKey="id"
        tableStyle="min-width: 100%"
      >
        <!-- Title column -->
        <Column field="title" header="Titre" :sortable="true" style="min-width: 250px">
          <template #body="slotProps">
            <RouterLink
              :to="`/quizzes/${slotProps.data.id}/edit`"
              class="link link-primary font-semibold"
            >
              {{ slotProps.data.title }}
            </RouterLink>
          </template>
        </Column>

        <!-- Type column -->
        <Column field="item_type" header="Type" :sortable="true" style="min-width: 120px">
          <template #body="slotProps">
            <span class="badge badge-primary badge-sm">
              {{ itemTypeLabel(slotProps.data.item_type) }}
            </span>
          </template>
        </Column>

        <!-- Items count column -->
        <Column header="Cartes" style="min-width: 90px">
          <template #body="slotProps">
            {{ quizItemCounts[slotProps.data.id] ?? '…' }}
          </template>
        </Column>

        <!-- Description column -->
        <Column field="description" header="Description" style="min-width: 200px">
          <template #body="slotProps">
            <p v-if="slotProps.data.description" class="text-sm truncate">
              {{ slotProps.data.description }}
            </p>
            <p v-else class="text-xs text-gray-400">-</p>
          </template>
        </Column>

        <!-- Updated column -->
        <Column field="updated" header="Modifié" :sortable="true" style="min-width: 120px">
          <template #body="slotProps">
            {{ dayjs(slotProps.data.updated).format('DD/MM/YYYY') }}
          </template>
        </Column>

        <!-- Actions column -->
        <Column header="Actions" style="min-width: 160px">
          <template #body="slotProps">
            <div class="flex gap-1">
              <RouterLink
                :to="`/quizzes/${slotProps.data.id}/edit`"
                class="btn btn-xs btn-ghost"
                title="Éditer"
              >
                <span class="i-fa-solid-pen"></span>
              </RouterLink>
              <button
                class="btn btn-xs btn-error"
                title="Supprimer"
                @click="openDeleteConfirm(slotProps.data)"
              >
                <span class="i-fa-solid-trash"></span>
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Delete confirmation modal -->
    <ConfirmModal
      v-model="showDeleteModal"
      title="Supprimer le quiz ?"
      :message="deleteMessage"
      @confirm="confirmDelete"
    />

    <!-- Add quiz modal -->
    <QuizAddModal v-model="showAddModal" @saved="handleQuizSaved" />

    <!-- Toast host -->
    <PbErrorToast />
  </div>
</template>
