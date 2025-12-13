<template>
  <router-view :categories="categories"></router-view>
</template>

<script setup lang="ts">
import { onBeforeMount, getCurrentInstance, type App } from 'vue';
import router from './router';

import type { TCategory } from '../../types'

defineProps<{ categories: TCategory.TRecord[] }>()

onBeforeMount(() => {
  const app = getCurrentInstance()?.appContext.app as App
  app.directive('focus', {
    mounted(el) {
      el.focus()
    }
  })
  app.use(router)
})
</script>
