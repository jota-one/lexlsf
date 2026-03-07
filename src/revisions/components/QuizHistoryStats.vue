<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

type SessionStats = { known: number; unknown: number; skipped: number; total: number }
type Session = { id: string; started_at: string; completed_at?: string; stats: SessionStats }

const props = defineProps<{ sessions: Session[] }>()

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

// — Taux de réussite (%) —
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

// — Mini graphique des dernières sessions —
const chartSessions = computed(() =>
  [...props.sessions]
    .filter(s => s.completed_at)
    .sort((a, b) => dayjs(a.completed_at).valueOf() - dayjs(b.completed_at).valueOf())
    .slice(-20),
)

const getRate = (s: Session) => {
  const answered = s.stats.known + s.stats.unknown
  return answered > 0 ? Math.round((s.stats.known / answered) * 100) : 0
}

const barColorClass = (rate: number) => {
  if (rate >= 80) return 'bg-success'
  if (rate >= 50) return 'bg-warning'
  return 'bg-error'
}

const barTooltip = (s: Session) => {
  const rate = getRate(s)
  const date = dayjs(s.completed_at).format('DD/MM')
  return `${date} — ${rate}% (${s.stats.known}✓ ${s.stats.unknown}✗ ${s.stats.skipped}⊘)`
}
</script>

<template>
  <div class="card bg-base-100 shadow p-4 space-y-4">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <span class="i-fa-solid-chart-bar text-primary"></span>
        Historique
      </h3>
      <div class="text-sm text-base-content/60">
        {{ sessions.length }} session{{ sessions.length > 1 ? 's' : '' }} · Dernière le
        {{ lastSessionDate }}
      </div>
    </div>

    <!-- Stats durée / réussite -->
    <div class="grid grid-cols-2 gap-6">
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

      <!-- Réussite -->
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-base-content/50">
          <span class="i-fa-solid-bullseye mr-1"></span>Réussite
        </p>
        <div class="space-y-1.5 text-sm">
          <div v-for="[label, rate] in [['↓', successMin], ['≈', successAvg], ['↑', successMax]]" :key="label" class="flex items-center gap-2">
            <span class="text-base-content/50 w-4 shrink-0">{{ label }}</span>
            <progress
              class="progress flex-1"
              :class="successBarClass(rate as number)"
              :value="rate"
              max="100"
            ></progress>
            <span class="font-mono w-9 text-right shrink-0" :class="(rate as number) >= 80 ? 'text-success' : (rate as number) >= 50 ? 'text-warning' : 'text-error'">
              {{ rate }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mini graphique -->
    <div v-if="chartSessions.length > 1" class="space-y-1">
      <p class="text-xs text-base-content/40 uppercase tracking-widest">Progression</p>
      <div class="flex items-end gap-0.5 h-10">
        <div
          v-for="s in chartSessions"
          :key="s.id"
          class="flex-1 rounded-sm opacity-80 hover:opacity-100 transition-opacity cursor-default min-w-1"
          :class="barColorClass(getRate(s))"
          :style="{ height: `${Math.max(10, getRate(s))}%` }"
          v-tooltip="barTooltip(s)"
        ></div>
      </div>
    </div>
  </div>
</template>
