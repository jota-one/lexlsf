<template>
  <div class="p-8 max-w-5xl">
    <h2 class="text-2xl font-bold mb-10 flex items-center gap-3">
      <span class="i-fa6-solid-map text-xl text-primary"></span>
      Feuille de route
    </h2>

    <!-- ── EN TRAIN DE MIJOTER ────────────────────────────────────────────── -->
    <section class="mb-14">
      <div class="flex items-center gap-3 mb-7">
        <span class="i-fa6-solid-fire text-2xl text-orange-400"></span>
        <h3 class="text-lg font-bold tracking-tight">En train de mijoter</h3>
      </div>

      <!-- Nouvelles fonctionnalités -->
      <template v-if="features.length">
        <p class="text-xs uppercase font-semibold tracking-widest opacity-40 mb-4">
          Nouvelles fonctionnalités
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div
            v-for="feature in features"
            :key="feature.id"
            class="group bg-base-100 border border-base-200 rounded-xl p-5 cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 flex flex-col gap-3"
            @click="openTask(feature)"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
              >
                <span :class="[categoryIcon(feature), 'text-primary text-base']"></span>
              </div>
              <div class="flex flex-col gap-1.5">
                <h4
                  class="font-semibold text-sm leading-snug group-hover:text-primary transition-colors"
                >
                  {{ feature.title }}
                </h4>
                <div class="flex gap-1.5">
                  <span class="badge badge-xs" :class="categoryBadgeClass(feature)">
                    {{ categoryOf(feature) }}
                  </span>
                  <span v-if="isInProgress(feature)" class="badge badge-xs badge-success">
                    En cours
                  </span>
                </div>
              </div>
            </div>
            <p class="text-xs text-base-content/50 line-clamp-2 pl-12">{{ excerpt(feature) }}</p>
            <div class="flex justify-end">
              <span
                class="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Voir le détail
                <span class="i-fa6-solid-arrow-right text-xs"></span>
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Améliorations -->
      <template v-if="improvements.length">
        <p class="text-xs uppercase font-semibold tracking-widest opacity-40 mb-4">
          Améliorations prévues
        </p>
        <div class="flex flex-col gap-2">
          <button
            v-for="improvement in improvements"
            :key="improvement.id"
            type="button"
            class="flex items-start gap-3 px-4 py-3 rounded-lg bg-base-100 border border-base-200 text-left cursor-pointer hover:border-primary transition-colors"
            @click="openTask(improvement)"
          >
            <span
              class="badge badge-sm mt-0.5 shrink-0 whitespace-nowrap"
              :class="categoryBadgeClass(improvement)"
            >
              {{ categoryOf(improvement) }}
            </span>
            <span class="text-sm text-base-content/80 flex-1">{{ improvement.title }}</span>
            <span
              v-if="isInProgress(improvement)"
              class="badge badge-sm badge-success mt-0.5 shrink-0"
            >
              En cours
            </span>
          </button>
        </div>
      </template>

      <p v-if="!features.length && !improvements.length" class="text-sm opacity-50">
        Rien sur le feu pour le moment.
      </p>
    </section>

    <!-- ── TOUT JUSTE SORTI DU FOUR ───────────────────────────────────────── -->
    <section>
      <div class="flex items-center gap-3 mb-7">
        <span class="i-fa6-solid-circle-check text-2xl text-success"></span>
        <h3 class="text-lg font-bold tracking-tight">Tout juste sorti du four</h3>
      </div>

      <ul class="timeline timeline-vertical timeline-snap-icon timeline-compact">
        <li v-for="entry in history" :key="entry.date + entry.title">
          <div class="timeline-middle">
            <span class="i-fa-solid-circle text-success"></span>
          </div>
          <div class="timeline-start mb-8">
            <time class="font-bold text-xs uppercase tracking-widest text-success/70">{{
              formatDate(entry.date)
            }}</time>
            <p class="font-semibold text-sm mt-0.5">{{ entry.title }}</p>
            <p v-if="entry.detail" class="text-xs text-base-content/50 mt-0.5 line-clamp-2">
              {{ entry.detail }}
            </p>
          </div>
          <hr class="bg-success/30" />
        </li>
      </ul>
    </section>

    <!-- ── MODAL détail d'une tâche ──────────────────────────────────────── -->
    <Dialog v-model:visible="showModal" modal :header="selectedTask?.title" class="w-[55%]">
      <template v-if="selectedTask">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <article class="prose prose-sm max-w-none" v-html="selectedTaskHtml" />
        <template v-if="selectedTask.acceptanceCriteria.length">
          <p class="text-xs uppercase font-semibold tracking-widest opacity-40 mt-6 mb-3">
            Ce qui est prévu
          </p>
          <ul class="flex flex-col gap-2">
            <li
              v-for="criterion in selectedTask.acceptanceCriteria"
              :key="criterion.text"
              class="flex items-start gap-2 text-sm"
            >
              <span
                class="mt-0.5 shrink-0"
                :class="
                  criterion.done
                    ? 'i-ic-outline-check-box text-success'
                    : 'i-ic-outline-check-box-outline-blank opacity-40'
                "
              ></span>
              <span :class="{ 'opacity-60': criterion.done }">{{ criterion.text }}</span>
            </li>
          </ul>
        </template>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { marked } from 'marked'
import Dialog from 'primevue/dialog'
import roadmapContent from '../../../ROADMAP.md?raw'
import { openTasks, type BacklogTask } from '@admin/helpers/backlogTasks'

// ─── Open work, from the backlog (backlog/tasks/*.md, read at build time) ────

const taskFiles = import.meta.glob<string>('../../../backlog/tasks/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const tasks = openTasks(Object.values(taskFiles))

const features = tasks.filter(task => task.type === 'feature')
const improvements = tasks.filter(task => task.type !== 'feature')

const isInProgress = (task: BacklogTask) => task.status === 'In Progress'

const excerpt = (task: BacklogTask) =>
  task.description
    .replace(/`[^`]+`/g, '')
    .split(/\.\s|\n/)[0]
    .trim()

// The first label naming an area of the site gives the task its category.
const CATEGORIES: Record<string, { name: string; icon: string; badge: string }> = {
  signes: { name: 'Signes', icon: 'i-fa6-solid-hands', badge: 'badge-primary' },
  quiz: { name: 'Quiz', icon: 'i-fa6-solid-layer-group', badge: 'badge-info' },
  revisions: { name: 'Révisions', icon: 'i-fa6-solid-chart-line', badge: 'badge-info' },
  culture: { name: 'Culture', icon: 'i-fa6-solid-address-card', badge: 'badge-secondary' },
  'culture-generale': {
    name: 'Culture générale',
    icon: 'i-fa6-solid-landmark',
    badge: 'badge-accent',
  },
  expressions: { name: 'Expressions', icon: 'i-fa6-solid-comments', badge: 'badge-warning' },
  recherche: { name: 'Recherche', icon: 'i-fa6-solid-magnifying-glass', badge: 'badge-ghost' },
  outils: { name: 'Outils', icon: 'i-fa6-solid-scissors', badge: 'badge-neutral' },
  interpretation: {
    name: 'Interprétation',
    icon: 'i-fa6-solid-people-arrows',
    badge: 'badge-ghost',
  },
  admin: { name: 'Admin', icon: 'i-fa6-solid-gear', badge: 'badge-ghost' },
}
const categoryKey = (task: BacklogTask) => task.labels.find(label => label in CATEGORIES)
const categoryOf = (task: BacklogTask) => {
  const key = categoryKey(task)
  return key ? CATEGORIES[key].name : 'Général'
}
const categoryIcon = (task: BacklogTask) => {
  const key = categoryKey(task)
  return key ? CATEGORIES[key].icon : 'i-fa6-solid-star'
}
const categoryBadgeClass = (task: BacklogTask) => {
  const key = categoryKey(task)
  return key ? CATEGORIES[key].badge : 'badge-ghost'
}

// ─── Delivered work, from the history in ROADMAP.md ─────────────────────────

interface HistoryEntry {
  date: string
  title: string
  detail: string
}

function parseHistory(raw: string): HistoryEntry[] {
  const archiveIdx = raw.indexOf('\nARCHIVE')
  const content = archiveIdx > -1 ? raw.slice(0, archiveIdx) : raw
  const history: HistoryEntry[] = []

  for (const section of content.split(/^## /m).slice(1)) {
    const [heading, ...rest] = section.split('\n')
    if (!heading.startsWith('Historique')) {
      continue
    }
    for (const line of rest) {
      const match = line.match(/^- \[(\d{4}-\d{2}-\d{2})\] (.+)/)
      if (!match) {
        continue
      }
      const [, date, text] = match
      const sep = text.indexOf(' — ')
      history.push({
        date,
        title: sep > -1 ? text.slice(0, sep).trim() : text.trim(),
        detail: sep > -1 ? text.slice(sep + 3).trim() : '',
      })
    }
  }

  return history
}

const history = parseHistory(roadmapContent)

// ─── Modal ──────────────────────────────────────────────────────────────────

const selectedTask = ref<BacklogTask | null>(null)
const showModal = ref(false)

const openTask = (task: BacklogTask) => {
  selectedTask.value = task
  showModal.value = true
}
const selectedTaskHtml = computed(() =>
  selectedTask.value ? String(marked.parse(selectedTask.value.description)) : '',
)

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]
const formatDate = (d: string) => {
  const [year, month, day] = d.split('-').map(Number)
  return `${day} ${MONTHS_FR[month - 1]} ${year}`
}
</script>
