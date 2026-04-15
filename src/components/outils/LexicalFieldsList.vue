<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-2">Champs lexicaux</h1>
    <p class="text-base-content/60 mb-8">Regroupements thématiques de termes en langue française.</p>

    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a
          v-for="field in fields"
          :key="field.id"
          :href="`/outils/champs-lexicaux/${field.slug}`"
          class="card card-border hover:shadow-md transition-shadow p-5"
        >
          <h2 class="text-xl font-semibold mb-2">{{ field.name }}</h2>
          <p v-if="field.introduction" class="text-sm text-base-content/70 line-clamp-3">{{ field.introduction }}</p>
        </a>
      </div>
      <p v-if="fields.length === 0" class="text-center text-base-content/50 py-16">Aucun champ lexical disponible.</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import useAuth from '@admin/composables/useAuth'

const { pb, isAuthenticated } = useAuth()
const fields = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!isAuthenticated.value) {
    sessionStorage.setItem('returnUrl', window.location.pathname)
    window.location.href = '/'
    return
  }
  try {
    fields.value = await pb.collection('lexical_field').getFullList({ sort: 'name' })
  } finally {
    loading.value = false
  }
})
</script>
