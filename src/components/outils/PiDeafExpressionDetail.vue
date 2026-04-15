<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <template v-else-if="expr">
      <a href="/outils/expressions-pi-sourdes" class="text-sm text-base-content/50 hover:text-base-content mb-4 inline-block">
        ← Expressions pi-sourdes
      </a>
      <h1 class="text-3xl font-bold mb-6">{{ expr.name || expr.expand?.Sign?.name }}</h1>

      <section v-if="expr.expand?.Sign" class="mb-8">
        <h2 class="text-lg font-semibold mb-3">
          Signe : <a :href="`/signs/${expr.expand.Sign.slug}`" class="text-primary hover:underline">{{ expr.expand.Sign.name }}</a>
        </h2>
        <video
          v-if="videoUrl"
          :src="videoUrl"
          controls
          class="rounded-xl max-w-md w-full"
          preload="metadata"
        />
      </section>

      <section v-if="strategiesHtml">
        <h2 class="text-lg font-semibold mb-2">Stratégies de transcription</h2>
        <div
          class="prose prose-sm md:prose-base max-w-none text-base-content prose-headings:text-base-content prose-strong:text-base-content prose-p:text-base-content/80"
          v-html="strategiesHtml"
        />
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import useAuth from '@admin/composables/useAuth'
import config from '../../config'

const props = defineProps<{ slug: string }>()

const { pb, isAuthenticated } = useAuth()
const expr = ref<any>(null)
const strategiesHtml = ref('')
const loading = ref(true)

const videoUrl = computed(() => {
  const sign = expr.value?.expand?.Sign
  return sign?.video ? `${config.apiBaseUrl}/api/files/sign/${sign.id}/${sign.video}` : null
})

onMounted(async () => {
  if (!isAuthenticated.value) {
    sessionStorage.setItem('returnUrl', window.location.pathname)
    window.location.href = '/'
    return
  }
  try {
    expr.value = await pb.collection('pi_deaf_expression').getFirstListItem(`slug="${props.slug}"`, {
      expand: 'Sign',
    })
    if (expr.value.strategies) {
      strategiesHtml.value = String(await marked.parse(String(expr.value.strategies)))
    }
  } finally {
    loading.value = false
  }
})
</script>
