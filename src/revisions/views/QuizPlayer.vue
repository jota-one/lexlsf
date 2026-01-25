<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useQuizzes from '@admin/composables/useQuizzes'
import useQuizSession from '@admin/composables/useQuizSession'
import usePbErrorToast from '@admin/composables/usePbErrorToast'
import { getQuizModes, getQuizMode, type QuizMode } from '@admin/config/quizModes'
import FlipCard from '../components/FlipCard.vue'
import QuizSummary from '../components/QuizSummary.vue'

const route = useRoute()
const router = useRouter()
const { loadQuiz } = useQuizzes()
const {
  startSession,
  resumeSession,
  currentSession,
  currentCard,
  progress,
  isComplete,
  logAttempt,
  completeSession,
  loadQuizSessions,
  deleteSession,
  getFileUrl,
  loading,
} = useQuizSession()
const { showPbError } = usePbErrorToast()

const quizTitle = ref('')
const quizItemType = ref<'sign' | 'person' | 'mixed'>('sign')
const modes = ref<QuizMode[]>([])
const selectedMode = ref<string>('')
const starting = ref(false)
const finished = ref(false)
const isFlipped = ref(false)
const cardStartTime = ref<number>(0)
const sessionStartTime = ref<number>(0)
const sessionDuration = ref<number>(0)
const incompleteSessions = ref<any[]>([])
const deletingSessionId = ref<string | null>(null)

const availableModes = computed(() => {
  if (quizItemType.value === 'mixed') return getQuizModes()
  return getQuizModes(quizItemType.value as 'sign' | 'person')
})

onMounted(async () => {
  try {
    const quizId = route.params.id as string
    const { quiz } = await loadQuiz(quizId)
    quizTitle.value = quiz.title
    quizItemType.value = quiz.item_type as any
    modes.value = availableModes.value
    selectedMode.value = modes.value[0]?.key || ''

    // Charger les sessions incomplètes (max 10 plus récentes)
    incompleteSessions.value = await loadQuizSessions(quizId, {
      onlyIncomplete: true,
      limit: 10,
    })
  } catch (error) {
    showPbError(error)
    router.replace('/revisions')
  }
})

// Time tracking
watch(currentCard, () => {
  cardStartTime.value = Date.now()
})

const start = async () => {
  if (!selectedMode.value) return
  starting.value = true
  try {
    const quizId = route.params.id as string
    await startSession(quizId, selectedMode.value)
    finished.value = false
    isFlipped.value = false
    sessionStartTime.value = Date.now()
    cardStartTime.value = Date.now()
  } catch (error) {
    showPbError(error)
  } finally {
    starting.value = false
  }
}

const handleAttempt = async (result: 'known' | 'unknown' | 'skip') => {
  const timeSpent = Date.now() - cardStartTime.value
  await logAttempt(result, timeSpent)
  isFlipped.value = false
  if (isComplete.value) {
    sessionDuration.value = Date.now() - sessionStartTime.value
    await completeSession()
    finished.value = true
  }
}

const currentMode = computed(() => modes.value.find(m => m.key === selectedMode.value))

const handleResume = async (sessionId: string) => {
  const session = incompleteSessions.value.find(s => s.id === sessionId)
  if (!session) return
  starting.value = true
  try {
    await resumeSession(session.id)
    selectedMode.value = session.config_key
    finished.value = false
    incompleteSessions.value = [] // Nettoyer la liste après reprise
    sessionStartTime.value = new Date(session.started_at).getTime()
    cardStartTime.value = Date.now()
  } catch (error) {
    showPbError(error)
  } finally {
    starting.value = false
  }
}

const dismissSessions = () => {
  incompleteSessions.value = []
}

const handleDeleteSession = async (sessionId: string) => {
  const session = incompleteSessions.value.find(s => s.id === sessionId)
  if (!session) return

  const confirmed = window.confirm('Supprimer cette session en cours ?')
  if (!confirmed) return

  deletingSessionId.value = sessionId
  try {
    await deleteSession(sessionId)
    incompleteSessions.value = incompleteSessions.value.filter(s => s.id !== sessionId)
  } catch (error) {
    showPbError(error)
  } finally {
    deletingSessionId.value = null
  }
}

const handleReviewErrors = () => {
  // TODO: implémenter en Phase 2
  console.log('Review errors clicked')
}

const handleRestart = async () => {
  finished.value = false
  sessionDuration.value = 0
  isFlipped.value = false
  // Relancer une nouvelle session avec le même mode
  await start()
}

const handleBackToList = () => {
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col h-full p-8">
    <button class="btn btn-ghost btn-sm" @click="$router.back()">← Retour</button>
    <h1 class="text-3xl font-bold mb-4">{{ quizTitle }}</h1>

    <!-- Sessions en cours -->
    <div v-if="incompleteSessions.length > 0 && !currentSession" class="card bg-base-100 shadow p-4 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold">Reprendre une session</h3>
        <button class="btn btn-ghost btn-sm" @click="dismissSessions">
          Masquer et démarrer une nouvelle session
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>Mode</th>
              <th>Progression</th>
              <th>Débutée</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="session in incompleteSessions" :key="session.id">
              <td>{{ getQuizMode(session.config_key)?.label }}</td>
              <td>
                {{ session.stats.known + session.stats.unknown + session.stats.skipped }} / {{ session.stats.total }}
              </td>
              <td>{{ new Date(session.started_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) }}</td>
              <td class="text-right space-x-2">
                <button
                  class="btn btn-primary btn-xs"
                  :disabled="starting || deletingSessionId === session.id"
                  @click="handleResume(session.id)"
                >
                  <span v-if="starting && deletingSessionId !== session.id" class="loading loading-spinner loading-xs"></span>
                  Reprendre
                </button>
                <button
                  class="btn btn-outline btn-error btn-xs"
                  :disabled="deletingSessionId === session.id"
                  @click="handleDeleteSession(session.id)"
                >
                  <span v-if="deletingSessionId === session.id" class="loading loading-spinner loading-xs"></span>
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Choix du mode -->
    <div v-if="!currentSession" class="card bg-base-100 shadow p-4 space-y-3">
      <h3 class="text-lg font-semibold">Commencer une nouvelle session</h3>
      <div class="grid gap-3 md:grid-cols-2">
        <label
          v-for="mode in availableModes"
          :key="mode.key"
          class="border rounded p-3 cursor-pointer flex gap-3 items-start"
          :class="selectedMode === mode.key ? 'border-primary' : 'border-base-200'"
          :disabled="currentSession !== null"
        >
          <input
            type="radio"
            class="radio radio-primary mt-1"
            :value="mode.key"
            v-model="selectedMode"
            :disabled="currentSession !== null"
          />
          <div>
            <p class="font-semibold">{{ mode.label }}</p>
            <p class="text-sm text-base-content/60">{{ mode.description }}</p>
          </div>
        </label>
      </div>
      <div class="flex justify-end">
        <button
          class="btn btn-primary btn-sm"
          :disabled="starting || currentSession !== null"
          @click="start"
        >
          <span v-if="starting" class="loading loading-spinner loading-sm"></span>
          Démarrer
        </button>
      </div>
    </div>

    <!-- Session en cours -->
    <div v-if="currentSession" class="space-y-3 flex-1 flex flex-col mt-4">
      <div v-if="!finished && currentCard && currentMode" class="flex-1 flex flex-col">
        <!-- Top bar: Buttons + Progress -->
        <div class="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-base-300">
          <!-- Action buttons (left) -->
          <div class="flex gap-2">
            <template v-if="!isFlipped">
              <button class="btn btn-outline btn-sm" @click="handleAttempt('skip')">
                Passer
              </button>
              <button class="btn btn-ghost btn-sm" @click="isFlipped = true">
                Retourner
              </button>
            </template>
            <template v-else>
              <button class="btn btn-error btn-lg" @click="handleAttempt('unknown')" title="Je ne savais pas">
                <span class="i-fa-solid-thumbs-down"></span>
              </button>
              <button class="btn btn-success btn-lg" @click="handleAttempt('known')" title="Je savais">
                <span class="i-fa-solid-thumbs-up"></span>
              </button>
            </template>
          </div>

          <!-- Progress (right) -->
          <div class="flex items-center gap-2 whitespace-nowrap">
            <div class="text-sm text-base-content/70">
              {{ progress.current }} / {{ progress.total }}
            </div>
            <progress
              class="progress progress-primary w-32"
              :value="progress.current"
              :max="progress.total"
            ></progress>
            <div v-if="loading" class="text-sm text-base-content/50">
              <span class="loading loading-spinner loading-xs"></span>
            </div>
          </div>
        </div>

        <!-- FlipCard -->
        <FlipCard
          :mode="currentMode"
          :card="currentCard"
          :get-file-url="getFileUrl"
          :is-flipped="isFlipped"
          @flip="isFlipped = $event"
        />
      </div>

      <div v-else-if="finished && currentSession && currentSession.stats" class="space-y-4">
        <QuizSummary
          :stats="currentSession.stats"
          :duration="sessionDuration"
          :quiz-title="quizTitle"
          @review-errors="handleReviewErrors"
          @restart="handleRestart"
          @back-to-list="handleBackToList"
        />
      </div>
    </div>
  </div>
</template>