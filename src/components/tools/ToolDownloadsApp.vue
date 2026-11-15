<template>
  <ToolDownloads />
</template>

<script setup lang="ts">
import { onBeforeMount, getCurrentInstance, type App } from 'vue'
import ToastService from 'primevue/toastservice'
import ToolDownloads from './ToolDownloads.vue'

onBeforeMount(() => {
  const app = getCurrentInstance()?.appContext.app as App
  if (app) {
    app.use(ToastService)
  }
})
</script>
