<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import Chart from 'primevue/chart'
import { computeQuizScore, scoreColorClass } from '../../helpers/quizScore'

type SessionStats = { known: number; unknown: number; skipped: number; total: number }
type Session = { id: string; started_at: string; completed_at?: string; stats: SessionStats }

const props = defineProps<{ sessions: Session[] }>()

// — Scores —
const scores = computed(() =>
  props.sessions
    .filter(s => s.completed_at && s.started_at)
    .map(s =>
      computeQuizScore({
        ...s.stats,
        durationSeconds: dayjs(s.completed_at).diff(dayjs(s.started_at), 'second'),
      }),
    )
    .filter(sc => sc > 0),
)

const scoreMin = computed(() => Math.min(...scores.value))
const scoreMax = computed(() => Math.max(...scores.value))
const scoreAvg = computed(() =>
  Math.round(scores.value.reduce((a, b) => a + b, 0) / scores.value.length),
)

// — Durées (en secondes) —
const durations = computed(() =>
  props.sessions
    .filter(s => s.completed_at && s.started_at)
    .map(s => dayjs(s.completed_at).diff(dayjs(s.started_at), 'second'))
    .filter(d => d > 0),
)

const durationMin = computed(() => Math.min(...durations.value))
const durationMax = computed(() => Math.max(...durations.value))
const durationAvg = computed(() =>
  Math.round(durations.value.reduce((a, b) => a + b, 0) / durations.value.length),
)

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m} min`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`
}

// — Vitesse (secondes par carte) —
const speeds = computed(() =>
  props.sessions
    .filter(s => s.completed_at && s.started_at && s.stats.total > 0)
    .map(s => {
      const dur = dayjs(s.completed_at).diff(dayjs(s.started_at), 'second')
      return Math.round((dur / s.stats.total) * 10) / 10 // 1 décimale
    })
    .filter(sp => sp > 0),
)

const speedMin = computed(() => Math.min(...speeds.value))
const speedMax = computed(() => Math.max(...speeds.value))
const speedAvg = computed(() =>
  Math.round((speeds.value.reduce((a, b) => a + b, 0) / speeds.value.length) * 10) / 10,
)

// — Taux de réussite brute (%) —
const successRates = computed(() =>
  props.sessions
    .map(s => {
      const answered = s.stats.known + s.stats.unknown
      return answered > 0 ? Math.round((s.stats.known / answered) * 100) : null
    })
    .filter((r): r is number => r !== null),
)

const successMin = computed(() => Math.min(...successRates.value))
const successMax = computed(() => Math.max(...successRates.value))
const successAvg = computed(() =>
  Math.round(successRates.value.reduce((a, b) => a + b, 0) / successRates.value.length),
)

const successBarClass = (rate: number) => {
  if (rate >= 80) return 'progress-success'
  if (rate >= 50) return 'progress-warning'
  return 'progress-error'
}

// — Dernière session —
const lastSessionDate = computed(() => {
  const sorted = [...props.sessions]
    .filter(s => s.completed_at)
    .sort((a, b) => dayjs(b.completed_at).valueOf() - dayjs(a.completed_at).valueOf())
  return sorted[0]?.completed_at
    ? dayjs(sorted[0].completed_at).format('DD/MM/YYYY')
    : '–'
})

// — Graphique ligne (20 dernières sessions, ordre chronologique) —
const chartSessions = computed(() =>
  [...props.sessions]
    .filter(s => s.completed_at)
    .sort((a, b) => dayjs(a.completed_at).valueOf() - dayjs(b.completed_at).valueOf())
    .slice(-20),
)

const chartData = computed(() => ({
  labels: chartSessions.value.map(s => dayjs(s.completed_at).format('DD/MM')),
  datasets: [
    {
      data: chartSessions.value.map(s =>
        computeQuizScore({
          ...s.stats,
          durationSeconds: dayjs(s.completed_at).diff(dayjs(s.started_at), 'second'),
        }),
      ),
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `Score : ${ctx.raw}`,
      },
    },
  },
  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: { stepSize: 25, color: 'rgba(0,0,0,0.35)', font: { size: 10 } },
      grid: { color: 'rgba(0,0,0,0.06)' },
      border: { display: false },
    },
    x: {
      ticks: { color: 'rgba(0,0,0,0.35)', font: { size: 10 } },
      grid: { display: false },
      border: { display: false },
    },
  },
}
</script>

<template>
  <div class="card bg-base-100 shadow p-4 space-y-4">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <span class="i-fa-solid-chart-line text-primary"></span>
        Historique
      </h3>
      <div class="text-sm text-base-content/60">
        {{ sessions.length }} session{{ sessions.length > 1 ? 's' : '' }} · Dernière le
        {{ lastSessionDate }}
      </div>
    </div>

    <!-- Score -->
    <div class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-widest text-base-content/50">
        <span class="i-fa-solid-star mr-1"></span>Score
      </p>
      <div class="flex gap-6 text-sm">
        <div class="flex items-center gap-1.5">
          <span class="text-base-content/40 text-xs">↓</span>
          <span class="font-mono font-semibold" :class="scoreColorClass(scoreMin)">{{ scoreMin }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-base-content/50 text-xs">≈</span>
          <span class="font-mono font-bold text-base" :class="scoreColorClass(scoreAvg)">{{ scoreAvg }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-base-content/40 text-xs">↑</span>
          <span class="font-mono font-semibold" :class="scoreColorClass(scoreMax)">{{ scoreMax }}</span>
        </div>
      </div>
      <div v-if="chartSessions.length > 1" class="h-36">
        <Chart type="line" :data="chartData" :options="chartOptions" class="h-full w-full" />
      </div>
    </div>

    <!-- Durée / Vitesse / Réussite brute -->
    <div class="grid grid-cols-3 gap-4 pt-3 border-t border-base-200">
      <!-- Durée -->
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-base-content/50">
          <span class="i-fa-solid-stopwatch mr-1"></span>Durée
        </p>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-base-content/50">↓ min</span>
            <span class="font-mono">{{ formatDuration(durationMin) }}</span>
          </div>
          <div class="flex justify-between font-semibold">
            <span class="text-base-content/60">≈ moy</span>
            <span class="font-mono">{{ formatDuration(durationAvg) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-base-content/50">↑ max</span>
            <span class="font-mono">{{ formatDuration(durationMax) }}</span>
          </div>
        </div>
      </div>

      <!-- Vitesse -->
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-base-content/50">
          <span class="i-fa-solid-bolt mr-1"></span>Vitesse
        </p>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-base-content/50">↓ min</span>
            <span class="font-mono">{{ speedMin }}s/c</span>
          </div>
          <div class="flex justify-between font-semibold">
            <span class="text-base-content/60">≈ moy</span>
            <span class="font-mono">{{ speedAvg }}s/c</span>
          </div>
          <div class="flex justify-between">
            <span class="text-base-content/50">↑ max</span>
            <span class="font-mono">{{ speedMax }}s/c</span>
          </div>
        </div>
      </div>

      <!-- Réussite brute -->
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-base-content/50">
          <span class="i-fa-solid-bullseye mr-1"></span>Réussite brute
        </p>
        <div class="space-y-1.5 text-sm">
          <div
            v-for="[label, rate] in [['↓', successMin], ['≈', successAvg], ['↑', successMax]]"
            :key="label"
            class="flex items-center gap-2"
          >
            <span class="text-base-content/50 w-4 shrink-0">{{ label }}</span>
            <progress
              class="progress flex-1"
              :class="successBarClass(rate as number)"
              :value="rate"
              max="100"
            ></progress>
            <span
              class="font-mono w-9 text-right shrink-0"
              :class="
                (rate as number) >= 80
                  ? 'text-success'
                  : (rate as number) >= 50
                    ? 'text-warning'
                    : 'text-error'
              "
            >
              {{ rate }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
