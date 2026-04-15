<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-2">Expressions françaises</h1>
    <p class="text-base-content/60 mb-8">Expressions idiomatiques et leurs stratégies pour les signer.</p>

    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <template v-else>
      <div class="flex flex-col gap-3">
        <a
          v-for="expr in expressions"
          :key="expr.id"
          :href="`/outils/expressions-francaises/${expr.slug}`"
          class="card card-border hover:shadow-md transition-shadow p-5"
        >
          <p class="font-medium text-lg">« {{ expr.expression }} »</p>
        </a>
      </div>
      <p v-if="expressions.length === 0" class="text-center text-base-content/50 py-16">Aucune expression disponible.</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import useAuth from '@admin/composables/useAuth'

const { pb, isAuthenticated } = useAuth()
const expressions = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!isAuthenticated.value) {
    sessionStorage.setItem('returnUrl', window.location.pathname)
    window.location.href = '/'
    return
  }
  try {
    expressions.value = await pb.collection('french_expression').getFullList({ sort: 'expression' })
  } finally {
    loading.value = false
  }
})
</script>
