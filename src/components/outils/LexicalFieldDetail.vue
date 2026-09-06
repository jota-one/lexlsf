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

      <div v-else class="columns-1 sm:columns-2 lg:columns-3 gap-4">
        <LexicalTermTypeCard
          v-for="group in groupedTerms"
          :key="group.key"
          :label="group.label || 'Non classés'"
          :terms="group.terms"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import useAuth from '@admin/composables/useAuth'
import LexicalTermTypeCard from './LexicalTermTypeCard.vue'
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
</script>
