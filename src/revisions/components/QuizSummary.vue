<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import durationPlugin from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/fr'
import type { QuizSessionStats } from '@admin/types/quiz'
import { computeQuizScore, scoreColorClass } from '../../helpers/quizScore'

dayjs.extend(durationPlugin)
dayjs.extend(relativeTime)
dayjs.locale('fr')

type Props = {
  stats: QuizSessionStats
  duration?: number
  quizTitle: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  reviewErrors: []
  restart: []
  backToList: []
}>()

const accuracy = computed(() => {
  const total = props.stats.known + props.stats.unknown
  if (total === 0) return 0
  return Math.round((props.stats.known / total) * 100)
})

const score = computed(() =>
  computeQuizScore({
    ...props.stats,
    durationSeconds: props.duration ? props.duration / 1000 : 0,
  }),
)

const hasErrors = computed(() => props.stats.unknown > 0)

const formatDuration = (ms?: number) => {
  if (!ms) return '-'

  return dayjs.duration(ms, 'millisecond').humanize()
}
</script>

<template>
  <div class="card bg-base-100 shadow-lg p-8 space-y-6">
    <div class="text-center space-y-2">
      <h2 class="text-3xl font-bold">Session terminée 🎉</h2>
      <p class="text-lg text-base-content/70">{{ quizTitle }}</p>
    </div>

    <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
      <div class="stat">
        <div class="stat-title">Score</div>
        <div
          class="stat-value"
          :class="scoreColorClass(score)"
        >
          {{ score }}
        </div>
        <div class="stat-desc">{{ accuracy }}% de réussite brute</div>
      </div>

      <div class="stat">
        <div class="stat-title">Cartes connues</div>
        <div class="stat-value text-success">{{ stats.known }}</div>
        <div class="stat-desc">Bien maîtrisées</div>
      </div>

      <div class="stat">
        <div class="stat-title">À revoir</div>
        <div class="stat-value text-error">{{ stats.unknown }}</div>
        <div class="stat-desc">Nécessitent révision</div>
      </div>

      <div class="stat">
        <div class="stat-title">Passées</div>
        <div class="stat-value text-base-content/50">{{ stats.skipped }}</div>
        <div class="stat-desc">Non évaluées</div>
      </div>
    </div>

    <div v-if="duration" class="alert">
      <span class="i-fa-solid-clock"></span>
      <span
        >Temps total : <strong>{{ formatDuration(duration) }}</strong></span
      >
    </div>

    <div class="flex flex-wrap gap-3 justify-center">
      <button v-if="hasErrors" class="btn btn-error btn-sm" @click="emit('reviewErrors')">
        <span class="i-fa-solid-redo"></span>
        Réviser mes erreurs
      </button>
      <button class="btn btn-primary btn-sm" @click="emit('restart')">
        <span class="i-fa-solid-play"></span>
        Recommencer
      </button>
      <button class="btn btn-ghost btn-sm" @click="emit('backToList')">
        <span class="i-fa-solid-arrow-left"></span>
        Retour à la liste
      </button>
    </div>
  </div>
</template>
