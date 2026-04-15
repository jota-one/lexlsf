<template>
  <router-view :categories="categories"></router-view>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, type App } from 'vue'
import router from './router'
import useAuth from '@admin/composables/useAuth'
import type { TCategory } from '../../types'

const { pb, isAuthenticated } = useAuth()
const categories = ref<TCategory.TRecord[]>([])

onMounted(async () => {
  if (!isAuthenticated.value) {
    window.location.href = '/'
    return
  }

  const app = getCurrentInstance()?.appContext.app as App
  app.directive('focus', {
    mounted(el) {
      el.focus()
    },
  })
  app.use(router)

  const raw = await pb.collection<TCategory.TRecord>('category').getFullList({
    fields: 'id, tag, slug, expand.category_via_Parent.*',
    sort: 'tag',
    filter: 'Parent = null',
    expand: 'category_via_Parent',
  })

  categories.value = raw
    .map(parentCat => {
      if (parentCat.expand?.category_via_Parent) {
        parentCat.expand.category_via_Parent = parentCat.expand.category_via_Parent
          .filter((cat: TCategory.TRecord) => {
            const ents = Array.isArray(cat.entities) ? (cat.entities as string[]) : []
            return ents.includes('person')
          })
          .sort((a: TCategory.TRecord, b: TCategory.TRecord) => a.tag.localeCompare(b.tag))
      }
      return parentCat
    })
    .filter(
      parentCat =>
        parentCat.expand?.category_via_Parent &&
        parentCat.expand.category_via_Parent.length > 0,
    )
})
</script>
