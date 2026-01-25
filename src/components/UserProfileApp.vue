<template>
  <UserProfile />
</template>

<script setup lang="ts">
import { onBeforeMount, getCurrentInstance, type App } from 'vue'
import ToastService from 'primevue/toastservice'
import UserProfile from './UserProfile.vue'

onBeforeMount(() => {
  const app = getCurrentInstance()?.appContext.app as App
  if (app) {
    app.use(ToastService)
  }
})
</script>
