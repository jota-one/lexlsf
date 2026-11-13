<template>
  <div class="flex flex-col h-full bg-base-200">
    <router-view></router-view>
    <!-- Lives outside the routes, so a message survives a redirect. -->
    <PbErrorToast />
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, getCurrentInstance, type App } from 'vue'
import router from './router'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import PbErrorToast from '@admin/components/PbErrorToast.vue'

onBeforeMount(() => {
  const app = getCurrentInstance()?.appContext.app as App
  app.directive('focus', {
    mounted(el) {
      el.focus()
    },
  })
  app.use(router)
  app.use(ToastService)
  app.directive('tooltip', Tooltip)
})
</script>
