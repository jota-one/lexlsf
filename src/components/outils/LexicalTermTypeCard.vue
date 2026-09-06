<template>
  <article class="card card-border bg-base-100 break-inside-avoid mb-4">
    <header class="flex items-center justify-between gap-2 px-4 py-3 border-b border-base-300">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-base-content/50 truncate">
        {{ label }}
      </h2>
      <span class="badge badge-sm badge-ghost shrink-0">{{ terms.length }}</span>
    </header>

    <div ref="body" class="term-list" :class="{ 'is-collapsed': !expanded }">
      <ul class="divide-y divide-base-300">
        <li v-for="term in terms" :id="`term-${term.id}`" :key="term.id" class="px-4 py-3">
          <div class="flex items-start gap-2">
            <div class="flex-1 min-w-0">
              <span class="font-medium">{{ term.term }}</span>

              <p v-if="term.note" class="text-sm whitespace-pre-line">
                {{ term.note }}
              </p>

              <p v-if="term.strategy" class="text-sm text-info whitespace-pre-line">
                {{ term.strategy }}
              </p>

              <div v-if="term.expand?.RelatedTerms?.length" class="flex flex-wrap gap-1 mt-1">
                <a
                  v-for="related in term.expand.RelatedTerms"
                  :key="related.id"
                  :href="relatedHref(related)"
                  class="badge badge-sm badge-ghost hover:badge-neutral"
                >
                  {{ related.term }}
                </a>
              </div>
            </div>

            <a
              v-if="term.expand?.Sign"
              :href="`/lexique/sign/${term.expand.Sign.slug}`"
              class="btn btn-sm btn-info hover:bg-sky-500 shrink-0"
              :aria-label="`Voir le signe ${term.expand.Sign.name}`"
              :title="`Voir le signe ${term.expand.Sign.name}`"
            >
              <span class="i-ic-round-sign-language"></span>
            </a>
          </div>
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
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef } from 'vue'
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

/**
 * Related terms link to `#term-<id>`, which may sit in a collapsed card:
 * expand it and bring the term into view.
 */
const revealHashTarget = async () => {
  const hash = window.location.hash
  if (!hash.startsWith('#term-') || !props.terms.some(term => `#term-${term.id}` === hash)) {
    return
  }
  expanded.value = true
  await nextTick()
  document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'center' })
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
</style>
