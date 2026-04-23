<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <template v-else-if="field">
      <a href="/outils/champs-lexicaux" class="text-sm text-base-content/50 hover:text-base-content mb-4 inline-block">
        ← Champs lexicaux
      </a>
      <h1 class="text-3xl font-bold mb-2">{{ field.name }}</h1>
      <p v-if="field.introduction" class="text-base-content/70 mb-8 max-w-2xl">{{ field.introduction }}</p>

      <div v-if="regularTerms.length === 0 && personTerms.length === 0" class="text-center text-base-content/50 py-16">
        Aucun terme dans ce champ lexical.
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonnes 1 & 2 : termes réguliers -->
        <div class="lg:col-span-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="term in regularTerms" :key="term.id" class="card card-border p-4 space-y-1">
              <span class="font-medium">{{ term.term }}</span>
              <p v-if="term.strategy" class="text-sm text-blue-600">{{ term.strategy }}</p>
              <a
                v-if="term.expand?.Sign"
                :href="`/lexique/sign/${term.expand.Sign.slug}`"
                class="text-sm text-primary hover:underline block"
              >
                → Voir le signe : {{ term.expand.Sign.name }}
              </a>
            </div>
          </div>
        </div>

        <!-- Colonne 3 : personnes -->
        <div v-if="personTerms.length > 0" class="space-y-4">
          <h2 class="text-lg font-semibold text-base-content/70">Personnes</h2>
          <div v-for="term in personTerms" :key="term.id" class="card card-border p-4 space-y-2">
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ term.term }}</span>
              <span v-if="isActive(term)" class="badge badge-success badge-sm">actif</span>
            </div>

            <div v-if="term.start_date || term.end_date" class="text-xs text-base-content/50">
              {{ formatDateRange(term.start_date, term.end_date) }}
            </div>

            <p v-if="term.strategy" class="text-sm text-blue-600">{{ term.strategy }}</p>
            <p v-if="term.description" class="text-sm text-base-content/70">{{ term.description }}</p>

            <div class="flex gap-2 flex-wrap">
              <a
                v-if="term.expand?.Person"
                :href="`/culture/person/${term.expand.Person.slug}`"
                class="text-sm text-primary hover:underline"
              >
                → Fiche Culture
              </a>
              <a
                v-if="term.expand?.Sign"
                :href="`/lexique/sign/${term.expand.Sign.slug}`"
                class="text-sm text-primary hover:underline"
              >
                → Voir le signe
              </a>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import useAuth from '@admin/composables/useAuth'

const props = defineProps<{ slug: string }>()

const { pb, isAuthenticated } = useAuth()
const field = ref<any>(null)
const terms = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!isAuthenticated.value) {
    sessionStorage.setItem('returnUrl', window.location.pathname)
    window.location.href = '/'
    return
  }
  try {
    field.value = await pb.collection('lexical_field').getFirstListItem(`slug="${props.slug}"`)
    terms.value = await pb.collection('lexical_term').getFullList({
      filter: `LexicalField = "${field.value.id}"`,
      expand: 'Sign,Person',
      sort: 'term',
    })
  } finally {
    loading.value = false
  }
})

const regularTerms = computed(() => terms.value.filter((t: any) => !t.is_person))

const personTerms = computed(() => {
  const persons = terms.value.filter((t: any) => t.is_person)
  return persons.sort((a: any, b: any) => {
    const aActive = isActive(a)
    const bActive = isActive(b)
    if (aActive !== bActive) return aActive ? -1 : 1
    // Both active or both inactive: sort by start_date desc
    if (a.start_date && b.start_date) return b.start_date.localeCompare(a.start_date)
    if (a.start_date) return -1
    if (b.start_date) return 1
    return a.term.localeCompare(b.term)
  })
})

const isActive = (term: any) => {
  if (!term.end_date) return true
  return new Date(term.end_date) >= new Date()
}

const formatDateRange = (start: string, end: string) => {
  const parts = []
  if (start) parts.push(new Date(start).getFullYear())
  if (end) parts.push(new Date(end).getFullYear())
  else if (start) parts.push('présent')
  return parts.join(' – ')
}
</script>
