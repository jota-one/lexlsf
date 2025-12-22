<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps<{
  content: string
}>()

const html = computed(() => {
  if (!props.content) return ''
  return marked.parse(props.content)
})
</script>

<template>
  <article v-html="html" />
</template>
