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

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="term in terms" :key="term.id" class="card card-border p-4">
          <span class="font-medium">{{ term.term }}</span>
          <a
            v-if="term.expand?.Sign"
            :href="`/signs/${term.expand.Sign.slug}`"
            class="text-sm text-primary hover:underline mt-1 block"
          >
            → Voir le signe : {{ term.expand.Sign.name }}
          </a>
        </div>
      </div>
      <p v-if="terms.length === 0" class="text-center text-base-content/50 py-16">Aucun terme dans ce champ lexical.</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
      expand: 'Sign',
      sort: 'term',
    })
  } finally {
    loading.value = false
  }
})
</script>
