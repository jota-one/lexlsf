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
      <p class="text-xs uppercase font-semibold tracking-widest opacity-40 mb-4">Nouvelles fonctionnalités</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="group bg-base-100 border border-base-200 rounded-xl p-5 cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 flex flex-col gap-3"
          @click="openFeature(feature)"
        >
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span :class="[featureIcon(feature.title), 'text-primary text-base']"></span>
            </div>
            <h4 class="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">{{ feature.title }}</h4>
          </div>
          <p class="text-xs text-base-content/50 line-clamp-2 pl-12">{{ feature.excerpt }}</p>
          <div class="flex justify-end">
            <span class="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Voir le détail
              <span class="i-fa6-solid-arrow-right text-xs"></span>
            </span>
          </div>
        </div>
      </div>

      <!-- Améliorations -->
      <p class="text-xs uppercase font-semibold tracking-widest opacity-40 mb-4">Améliorations prévues</p>
      <div class="flex flex-col gap-2">
        <div
          v-for="(imp, i) in improvements"
          :key="i"
          class="flex items-start gap-3 px-4 py-3 rounded-lg bg-base-100 border border-base-200"
        >
          <span class="badge badge-sm mt-0.5 shrink-0 whitespace-nowrap" :class="categoryBadgeClass(imp.category)">
            {{ imp.category }}
          </span>
          <span class="text-sm text-base-content/80">{{ imp.text }}</span>
        </div>
      </div>
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
            <time class="font-bold text-xs uppercase tracking-widest text-success/70">{{ formatDate(entry.date) }}</time>
            <p class="font-semibold text-sm mt-0.5">{{ entry.title }}</p>
            <p v-if="entry.detail" class="text-xs text-base-content/50 mt-0.5 line-clamp-2">{{ entry.detail }}</p>
          </div>
          <hr class="bg-success/30" />
        </li>
      </ul>
    </section>

    <!-- ── MODAL détail fonctionnalité ───────────────────────────────────── -->
    <Dialog v-model:visible="showModal" modal :header="selectedFeature?.title" class="w-[55%]">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <article class="prose prose-sm max-w-none" v-html="selectedFeatureHtml" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { marked } from 'marked'
import Dialog from 'primevue/dialog'
import roadmapContent from '../../../ROADMAP.md?raw'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Feature { title: string; excerpt: string; content: string }
interface Improvement { category: string; text: string }
interface HistoryEntry { date: string; title: string; detail: string }

// ─── Parser ─────────────────────────────────────────────────────────────────

function parseRoadmap(raw: string) {
  const archiveIdx = raw.indexOf('\nARCHIVE')
  const content = archiveIdx > -1 ? raw.slice(0, archiveIdx) : raw

  const features: Feature[] = []
  const improvements: Improvement[] = []
  const history: HistoryEntry[] = []

  for (const section of content.split(/^## /m).slice(1)) {
    const [heading, ...rest] = section.split('\n')
    const body = rest.join('\n').trim()

    if (heading.startsWith('Améliorations')) {
      for (const line of body.split('\n')) {
        const match = line.match(/^- (.+)/)
        if (!match) { continue }
        const text = match[1].trim()
        improvements.push({ category: extractCategory(text), text })
      }
    } else if (heading.startsWith('Nouvelles')) {
      for (const sub of body.split(/^### /m).slice(1)) {
        const [title, ...lines] = sub.split('\n')
        const subContent = lines.join('\n').trim()
        const excerpt = subContent.replace(/`[^`]+`/g, '').split(/[.\n]/)[0].trim()
        features.push({ title: title.trim(), excerpt, content: subContent })
      }
    } else if (heading.startsWith('Historique')) {
      for (const line of body.split('\n')) {
        const match = line.match(/^- \[(\d{4}-\d{2}-\d{2})\] (.+)/)
        if (!match) { continue }
        const [, date, rest2] = match
        const sep = rest2.indexOf(' — ')
        history.push({
          date,
          title: sep > -1 ? rest2.slice(0, sep).trim() : rest2.trim(),
          detail: sep > -1 ? rest2.slice(sep + 3).trim() : '',
        })
      }
    }
  }

  return { features, improvements, history }
}

function extractCategory(text: string): string {
  if (text.startsWith('Culture générale')) { return 'Culture générale' }
  if (text.startsWith('Culture')) { return 'Culture' }
  if (text.startsWith('Quizz')) { return 'Quiz' }
  if (text.startsWith('Expression')) { return 'Expressions' }
  return 'Général'
}

const { features, improvements, history } = parseRoadmap(roadmapContent)

// ─── Modal ──────────────────────────────────────────────────────────────────

const selectedFeature = ref<Feature | null>(null)
const showModal = ref(false)

const openFeature = (f: Feature) => { selectedFeature.value = f; showModal.value = true }
const selectedFeatureHtml = computed(() =>
  selectedFeature.value ? String(marked.parse(selectedFeature.value.content)) : ''
)

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const formatDate = (d: string) => {
  const [year, month, day] = d.split('-').map(Number)
  return `${day} ${MONTHS_FR[month - 1]} ${year}`
}

const ICONS: [string, string][] = [
  ['lien', 'i-fa6-solid-link'],
  ['bibliographie', 'i-fa6-solid-link'],
  ['mouvement', 'i-fa6-solid-hand'],
  ['reporting', 'i-fa6-solid-chart-line'],
  ['révision', 'i-fa6-solid-chart-line'],
  ['trombinoscope', 'i-fa6-solid-address-card'],
  ['signe', 'i-fa6-solid-hands'],
]
const featureIcon = (title: string) => {
  const lower = title.toLowerCase()
  return ICONS.find(([k]) => lower.includes(k))?.[1] ?? 'i-fa6-solid-star'
}

const BADGE_CLASSES: Record<string, string> = {
  'Culture générale': 'badge-accent',
  'Culture': 'badge-secondary',
  'Quiz': 'badge-info',
  'Expressions': 'badge-warning',
}
const categoryBadgeClass = (cat: string) => BADGE_CLASSES[cat] ?? 'badge-ghost'
</script>
