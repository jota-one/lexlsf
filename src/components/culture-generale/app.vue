<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, getCurrentInstance, type App } from 'vue'
import { RouterView } from 'vue-router'
import router from './router'
import useAuth from '@admin/composables/useAuth'

const { isAuthenticated, refreshAuth } = useAuth()

onBeforeMount(() => {
  const app = getCurrentInstance()?.appContext.app as App
  app.use(router)
})

onMounted(async () => {
  if (!isAuthenticated.value) {
    window.location.href = '/'
    return
  }
  await refreshAuth()
})
</script>
