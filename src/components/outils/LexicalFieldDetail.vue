<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <template v-else-if="field">
      <a
        href="/outils/champs-lexicaux"
        class="text-sm text-base-content/50 hover:text-base-content mb-4 inline-block"
      >
        ← Champs lexicaux
      </a>
      <h1 class="text-3xl font-bold mb-2">{{ field.name }}</h1>
      <p v-if="field.introduction" class="text-base-content/70 mb-8 max-w-2xl">
        {{ field.introduction }}
      </p>

      <div v-if="terms.length === 0" class="text-center text-base-content/50 py-16">
        Aucun terme dans ce champ lexical.
      </div>

      <div v-else class="space-y-8">
        <section v-for="group in groupedTerms" :key="group.key">
          <h2
            v-if="group.label"
            class="text-sm font-semibold uppercase tracking-wide text-base-content/50 mb-3"
          >
            {{ group.label }}
          </h2>

          <ul class="divide-y divide-base-300 border-y border-base-300">
            <li v-for="term in group.terms" :id="`term-${term.id}`" :key="term.id" class="py-3">
              <div class="flex items-start gap-2">
                <div class="flex-1 min-w-0">
                  <span class="font-medium">{{ term.term }}</span>

                  <p v-if="term.strategy" class="text-sm text-info whitespace-pre-line">
                    {{ term.strategy }}
                  </p>

                  <p v-if="term.note" class="text-sm whitespace-pre-line">{{ term.note }}</p>

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
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import useAuth from '@admin/composables/useAuth'
import type { TLexicalField, TLexicalTerm } from '../../types'

type Props = {
  slug: string
}
const props = defineProps<Props>()

const { pb, isAuthenticated } = useAuth()
const field = ref<TLexicalField.TRecord | null>(null)
const terms = ref<TLexicalTerm.TRecord[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!isAuthenticated.value) {
    sessionStorage.setItem('returnUrl', window.location.pathname)
    window.location.href = '/'
    return
  }
  try {
    field.value = await pb
      .collection<TLexicalField.TRecord>('lexical_field')
      .getFirstListItem(pb.filter('slug = {:slug}', { slug: props.slug }))
    const list = await pb.collection<TLexicalTerm.TRecord>('lexical_term').getFullList({
      filter: pb.filter('LexicalField = {:id}', { id: field.value.id }),
      expand: 'Sign,Type,RelatedTerms,RelatedTerms.LexicalField',
    })
    // SQLite sorts accented letters after Z; re-sort locale-aware (É next to E).
    terms.value = list.sort((a, b) => a.term.localeCompare(b.term))
  } finally {
    loading.value = false
  }
})

/**
 * Terms are grouped by their type, types in alphabetical order,
 * untyped terms last.
 */
const groupedTerms = computed(() => {
  const groups = new Map<string, { key: string; label: string; terms: TLexicalTerm.TRecord[] }>()

  for (const term of terms.value) {
    const key = term.expand?.Type?.id || ''
    const label = term.expand?.Type?.tag || ''
    if (!groups.has(key)) {
      groups.set(key, { key, label, terms: [] })
    }
    groups.get(key)?.terms.push(term)
  }

  return [...groups.values()].sort((a, b) => {
    if (!a.label) {
      return 1
    }
    if (!b.label) {
      return -1
    }
    return a.label.localeCompare(b.label)
  })
})

const relatedHref = (related: TLexicalTerm.TRelatedTerm) => {
  const fieldSlug = related.expand?.LexicalField?.slug
  if (!fieldSlug) {
    return `#term-${related.id}`
  }
  return `/outils/champs-lexicaux/${fieldSlug}#term-${related.id}`
}
</script>
