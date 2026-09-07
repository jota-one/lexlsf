<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-2">Champs lexicaux</h1>
    <p class="text-base-content/60 mb-8">
      Regroupements thématiques de termes en langue française.
    </p>

    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <a
          v-for="field in fields"
          :key="field.id"
          :href="`/outils/champs-lexicaux/${field.slug}`"
          class="card bg-base-300 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md aspect-square"
          :class="SECTION_ACCENTS.outils.cardHover"
        >
          <div class="card-body items-center justify-center p-4 gap-2">
            <h2 class="card-title text-xl md:text-2xl text-center">{{ field.name }}</h2>
            <span class="badge badge-sm bg-base-content/10 border-0">
              {{ termLabel(termCounts[field.id] ?? 0) }}
            </span>
          </div>
        </a>
      </div>
      <p v-if="fields.length === 0" class="text-center text-base-content/50 py-16">
        Aucun champ lexical disponible.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import useAuth from '@admin/composables/useAuth'
import { SECTION_ACCENTS } from '@config/sectionAccents'
import type { TLexicalField } from '../../types'

const { pb, isAuthenticated } = useAuth()
const fields = ref<TLexicalField.TRecord[]>([])
const termCounts = ref<Record<string, number>>({})
const loading = ref(true)

const termLabel = (count: number) => `${count} ${count === 1 ? 'terme' : 'termes'}`

onMounted(async () => {
  if (!isAuthenticated.value) {
    sessionStorage.setItem('returnUrl', window.location.pathname)
    window.location.href = '/'
    return
  }
  try {
    const [list, terms] = await Promise.all([
      pb.collection<TLexicalField.TRecord>('lexical_field').getFullList({ sort: 'name' }),
      // Only the owning field is needed: the counts are aggregated client-side,
      // the same way the lexicon and Culture grids count their categories.
      pb
        .collection<{ LexicalField: string }>('lexical_term')
        .getFullList({ fields: 'LexicalField', requestKey: null }),
    ])
    const counts: Record<string, number> = {}
    for (const term of terms) {
      counts[term.LexicalField] = (counts[term.LexicalField] ?? 0) + 1
    }
    fields.value = list
    termCounts.value = counts
  } finally {
    loading.value = false
  }
})
</script>
