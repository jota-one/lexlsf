<template>
  <article
    class="card border-2 border-base-content/25 bg-base-100 shadow-md break-inside-avoid mb-4 overflow-hidden"
  >
    <header class="flex items-center gap-1 pl-1 pr-3 py-2 bg-logo-yellow text-neutral">
      <button
        type="button"
        class="btn btn-ghost btn-xs px-1 text-neutral hover:bg-neutral/10"
        :aria-expanded="expanded"
        :aria-label="`${expanded ? 'Replier' : 'Déplier'} ${label}`"
        @click="expanded = !expanded"
      >
        <span :class="expanded ? 'i-fa-solid-chevron-down' : 'i-fa-solid-chevron-right'"></span>
      </button>
      <h2 class="flex-1 text-sm font-bold uppercase tracking-wide truncate">
        {{ label }}
      </h2>
      <span class="badge badge-sm border-0 bg-neutral text-neutral-content shrink-0">
        {{ terms.length }}
      </span>
    </header>

    <div ref="body" class="term-list" :class="{ 'is-collapsed': !expanded }">
      <ul class="columns-2 gap-0">
        <li
          v-for="term in terms"
          :id="`term-${term.id}`"
          :key="term.id"
          class="break-inside-avoid px-3 py-1.5 text-sm border-b border-base-200"
          :class="{ 'is-highlighted': term.id === highlightedId, 'has-detail': hasDetail(term) }"
          :tabindex="hasDetail(term) ? 0 : undefined"
          @mouseenter="openDetail(term, $event)"
          @focusin="openDetail(term, $event)"
          @mouseleave="scheduleClose"
          @focusout="scheduleClose"
        >
          <span class="font-medium" :class="{ 'is-annotated': isAnnotated(term) }">
            {{ term.term }}
          </span>
          <span
            v-if="term.expand?.Sign"
            class="i-ic-round-sign-language align-middle ml-1 text-info"
            aria-hidden="true"
          ></span>
        </li>
      </ul>
    </div>

    <button
      v-if="expanded || overflowing"
      type="button"
      class="btn btn-ghost btn-xs w-full gap-1 border-t border-base-300 rounded-t-none"
      @click="expanded = !expanded"
    >
      {{ expanded ? 'Réduire' : `Voir les ${terms.length} termes` }}
      <span :class="expanded ? 'i-fa-solid-chevron-up' : 'i-fa-solid-chevron-down'"></span>
    </button>
  </article>

  <!--
    Teleported so the panel escapes the card's clipped, multi-column layout;
    the terms are already loaded, so nothing is fetched on hover.
  -->
  <Teleport to="body">
    <div
      v-if="detailed"
      ref="popover"
      class="term-detail card bg-base-100 border border-base-content/25 shadow-xl p-3 space-y-2"
      :style="popoverStyle"
      @mouseenter="keepOpen"
      @focusin="keepOpen"
      @mouseleave="scheduleClose"
      @focusout="scheduleClose"
    >
      <p class="font-semibold text-sm">{{ detailed.term }}</p>

      <p v-if="detailed.note" class="text-sm whitespace-pre-line">
        {{ detailed.note }}
      </p>

      <p v-if="detailed.strategy" class="text-sm text-info whitespace-pre-line">
        {{ detailed.strategy }}
      </p>

      <div v-if="detailed.expand?.RelatedTerms?.length" class="flex flex-wrap gap-1">
        <a
          v-for="related in detailed.expand.RelatedTerms"
          :key="related.id"
          :href="relatedHref(related)"
          class="badge badge-sm badge-ghost hover:badge-neutral"
        >
          {{ related.term }}
        </a>
      </div>

      <a
        v-if="detailed.expand?.Sign"
        :href="`/lexique/sign/${detailed.expand.Sign.slug}`"
        class="btn btn-sm btn-info w-full gap-2"
      >
        <span class="i-ic-round-sign-language"></span>
        Voir le signe
      </a>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount, ref, useTemplateRef } from 'vue'
import { useEventListener, useResizeObserver } from '@vueuse/core'
import type { TLexicalTerm } from '../../types'

type Props = {
  label: string
  terms: TLexicalTerm.TRecord[]
}
const props = defineProps<Props>()

const relatedHref = (related: TLexicalTerm.TRelatedTerm) => {
  const fieldSlug = related.expand?.LexicalField?.slug
  if (!fieldSlug) {
    return `#term-${related.id}`
  }
  return `/outils/champs-lexicaux/${fieldSlug}#term-${related.id}`
}

const bodyRef = useTemplateRef<HTMLElement>('body')
const expanded = ref(false)
const overflowing = ref(false)
const highlightedId = ref('')

/**
 * Only meaningful while collapsed: once expanded the list is never clipped, so
 * the last measured value is kept and the toggle stays available.
 */
const measure = () => {
  const el = bodyRef.value
  if (!el || expanded.value) {
    return
  }
  overflowing.value = el.scrollHeight - el.clientHeight > 1
}

useResizeObserver(bodyRef, measure)

/* ---- Hover detail ---- */

const popoverRef = useTemplateRef<HTMLElement>('popover')
const detailed = ref<TLexicalTerm.TRecord | null>(null)
const popoverStyle = ref<Record<string, string>>({})
let closeTimer: ReturnType<typeof setTimeout> | undefined

/** The list only shows the term itself, so a term with nothing else stays flat. */
const hasDetail = (term: TLexicalTerm.TRecord) =>
  Boolean(term.note || term.strategy || term.expand?.Sign || term.expand?.RelatedTerms?.length)

/**
 * A note or a strategy is text that only the hover panel shows, so the term is
 * underlined to announce it. A sign already has its own icon, and related terms
 * are reachable from the other side of the link.
 */
const isAnnotated = (term: TLexicalTerm.TRecord) => Boolean(term.note || term.strategy)

const keepOpen = () => clearTimeout(closeTimer)

/** Short grace period so the pointer can travel from the term to the panel. */
const scheduleClose = () => {
  clearTimeout(closeTimer)
  closeTimer = setTimeout(() => (detailed.value = null), 150)
}

const openDetail = async (term: TLexicalTerm.TRecord, event: Event) => {
  keepOpen()
  if (!hasDetail(term)) {
    detailed.value = null
    return
  }
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  detailed.value = term
  // Render it off-screen first so it can be measured before being placed.
  popoverStyle.value = { left: '0px', top: '0px', visibility: 'hidden' }
  await nextTick()

  const el = popoverRef.value
  if (!el || detailed.value !== term) {
    return
  }
  const { offsetWidth: width, offsetHeight: height } = el
  // Directly under the term, edge to edge: the pointer has to reach the panel
  // to click the links it holds, so it must not have to cross a gap.
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
  const fitsBelow = rect.bottom + height <= window.innerHeight - 8
  popoverStyle.value = {
    left: `${left}px`,
    top: `${fitsBelow ? rect.bottom : Math.max(8, rect.top - height)}px`,
  }
}

// The panel is anchored to a viewport position, so it must not linger.
useEventListener(window, 'scroll', () => (detailed.value = null), { passive: true })
onBeforeUnmount(() => clearTimeout(closeTimer))

/* ---- Deep links ---- */

/**
 * Related terms link to `#term-<id>`, which may sit in a collapsed card: expand
 * it, highlight the term and bring it into view. The highlight cannot rely on
 * `:target` — the terms are rendered client-side, long after the browser has
 * resolved the fragment, so it would never match on a cross-field link.
 */
const revealHashTarget = async () => {
  const hash = window.location.hash
  const target = hash.startsWith('#term-')
    ? props.terms.find(term => `#term-${term.id}` === hash)
    : undefined

  highlightedId.value = target?.id || ''
  if (!target) {
    return
  }

  expanded.value = true
  await nextTick()
  document.getElementById(`term-${target.id}`)?.scrollIntoView({ block: 'center' })
}

useEventListener(window, 'hashchange', revealHashTarget)

onMounted(async () => {
  measure()
  await revealHashTarget()
})
</script>

<style scoped>
.term-list {
  overflow: hidden;
}

/*
 * Three rows of cards should fit a screen: the subtracted height covers the
 * page heading, the card headers/toggles and the grid gaps. A floor keeps the
 * cards readable on short screens, even if the third row then falls below.
 */
.term-list.is-collapsed {
  max-height: max(8rem, calc((100dvh - 34rem) / 3));
}

/* Hints that hovering the term reveals its detail. */
.term-list li.has-detail {
  cursor: help;
}

/* Announces a note or a strategy before the term is hovered. */
.term-list .is-annotated {
  text-decoration: underline dotted;
  text-underline-offset: 3px;
  text-decoration-color: color-mix(in oklch, var(--color-base-content) 50%, transparent);
}

.term-list li.has-detail:hover,
.term-list li.has-detail:focus-visible {
  background-color: color-mix(in oklch, var(--color-base-content) 6%, transparent);
  outline: none;
}

/* The term a related link points at stays highlighted, after a short flash. */
.term-list li.is-highlighted {
  background-color: color-mix(in oklch, var(--color-base-content) 14%, transparent);
  box-shadow: inset 3px 0 0 color-mix(in oklch, var(--color-base-content) 55%, transparent);
  animation: term-flash 1.2s ease-out;
}

@keyframes term-flash {
  from {
    background-color: color-mix(in oklch, var(--color-base-content) 40%, transparent);
  }
}
</style>

<style>
/* Teleported to <body>, so it sits outside the scoped-style tree. */
.term-detail {
  position: fixed;
  z-index: 60;
  width: 18rem;
  max-width: calc(100vw - 1rem);
}
</style>
