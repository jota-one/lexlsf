<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <template v-else-if="expr">
      <a href="/outils/expressions-francaises" class="text-sm text-base-content/50 hover:text-base-content mb-4 inline-block">
        ← Expressions françaises
      </a>
      <h1 class="text-3xl font-bold mb-6">« {{ expr.expression }} »</h1>

      <section v-if="strategiesHtml" class="mb-8">
        <h2 class="text-lg font-semibold mb-2">Stratégies</h2>
        <div
          class="prose prose-sm md:prose-base max-w-none text-base-content prose-headings:text-base-content prose-strong:text-base-content prose-p:text-base-content/80"
          v-html="strategiesHtml"
        />
      </section>

      <section v-if="expr.expand?.Signs?.length > 0">
        <h2 class="text-lg font-semibold mb-3">Signes utiles</h2>
        <div class="flex flex-wrap gap-2">
          <a
            v-for="sign in expr.expand.Signs"
            :key="sign.id"
            :href="`/signs/${sign.slug}`"
            class="badge badge-primary badge-lg"
          >
            {{ sign.name }}
          </a>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import useAuth from '@admin/composables/useAuth'

const props = defineProps<{ slug: string }>()

const { pb, isAuthenticated } = useAuth()
const expr = ref<any>(null)
const strategiesHtml = ref('')
const loading = ref(true)

onMounted(async () => {
  if (!isAuthenticated.value) {
    sessionStorage.setItem('returnUrl', window.location.pathname)
    window.location.href = '/'
    return
  }
  try {
    expr.value = await pb.collection('french_expression').getFirstListItem(`slug="${props.slug}"`, {
      expand: 'Signs',
    })
    if (expr.value.strategies) {
      strategiesHtml.value = String(await marked.parse(String(expr.value.strategies)))
    }
  } finally {
    loading.value = false
  }
})
</script>
