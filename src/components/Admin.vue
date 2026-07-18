<template>
  <div v-if="!ready" class="flex justify-center items-center min-h-screen">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
  <Sidebar v-else>
    <router-view></router-view>
  </Sidebar>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, getCurrentInstance, type App } from 'vue';
import router from '../admin/router';
import useAuth from '../admin/composables/useAuth';
import Sidebar from '../admin/layouts/Sidebar.vue';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import 'vue3-markdown/dist/vue3-markdown.css';

const ready = ref(false)
const { refreshAuth } = useAuth()

onBeforeMount(async () => {
  const app = getCurrentInstance()?.appContext.app as App
  app.directive('focus', {
    mounted(el) {
      el.focus()
    }
  })
  app.use(ToastService)
  app.directive('tooltip', Tooltip);

  // Load the session and roles once, before the router guard can rely on them
  await refreshAuth()
  app.use(router)
  ready.value = true
})
</script>
