<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useQuizzes from '@admin/composables/useQuizzes'
import usePbErrorToast from '@admin/composables/usePbErrorToast'

const router = useRouter()
const { quizzes, loading, quizItemCounts, loadQuizzes } = useQuizzes()
const { showPbError } = usePbErrorToast()

onMounted(async () => {
  try {
    await loadQuizzes()
  } catch (error) {
    showPbError(error)
  }
})

const startQuiz = (quizId: string) => {
  router.push(`/quiz/${quizId}`)
}

const itemTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    sign: 'Signes',
    person: 'Personnes',
    mixed: 'Mixte',
  }
  return labels[type] || type
}
</script>

<template>
  <div class="p-8">
    <h1 class="text-4xl font-bold mb-8">Révisions</h1>

    <div v-if="loading" class="card p-6 text-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="quizzes.length === 0" class="card p-8 text-center text-base-content/50">
      <p class="text-lg">Aucun quiz disponible pour le moment.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="quiz in quizzes"
        :key="quiz.id"
        class="card card-compact bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        @click="startQuiz(quiz.id)"
      >
        <div class="card-body">
          <h2 class="card-title text-lg">{{ quiz.title }}</h2>
          <p class="text-sm text-base-content/60">{{ quiz.description }}</p>
          <div class="flex items-center gap-4 mt-4 text-sm">
            <div class="badge badge-primary">{{ itemTypeLabel(quiz.item_type) }}</div>
            <div class="flex items-center gap-1">
              <span class="i-fa-solid-layer-group"></span>
              <span>{{ quizItemCounts[quiz.id] ?? 0 }} cartes</span>
            </div>
          </div>
        </div>
        <div class="card-actions justify-end p-4">
          <button class="btn btn-primary btn-sm">Commencer</button>
        </div>
      </div>
    </div>
  </div>
</template>