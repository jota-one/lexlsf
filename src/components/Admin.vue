<template>
  <Sidebar>
    <router-view></router-view>
  </Sidebar>
</template>

<script setup lang="ts">
import { onBeforeMount, getCurrentInstance, type App } from 'vue';
import router from '../admin/router';
import Sidebar from '../admin/layouts/Sidebar.vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

onBeforeMount(() => {
  const app = getCurrentInstance()?.appContext.app as App
  app.directive('focus', {
    mounted(el) {
      el.focus()
    }
  })
  app.use(router)
  app.use(PrimeVue, {
    theme: {
      preset: Aura
    }
  })
})
</script>