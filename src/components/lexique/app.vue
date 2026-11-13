<template>
  <router-view
    :categories="categories"
    :category-counts="categoryCounts"
    section="lexique"
  ></router-view>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, type App } from 'vue'
import router from './router'
import useAuth from '@admin/composables/useAuth'
import type { SignCountPerCategoryResponse, TCategory } from '@types'

const { pb, isAuthenticated, isAdmin, roles, refreshAuth } = useAuth()
const categories = ref<TCategory.TRecord[]>([])
const categoryCounts = ref<Record<string, number>>({})

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

  // Ensure roles are fully loaded before branching on isAdmin.
  await refreshAuth()

  const categoriesPromise = pb.collection<TCategory.TRecord>('category').getFullList({
    fields: 'id, tag, slug, expand.category_via_Parent.*',
    sort: 'tag',
    filter: 'Parent = null',
    expand: 'category_via_Parent',
  })

  // Admin sees all signs (listRule lets all through) → exact count client-side.
  // Students use the pre-aggregated view filtered by their role(s).
  const adminCountsPromise = isAdmin.value
    ? pb.collection('sign').getFullList({ fields: 'Category', requestKey: null })
    : Promise.resolve([])
  const roleCountsPromise = isAdmin.value
    ? Promise.resolve([])
    : pb
        .collection('sign_count_per_category')
        .getFullList<SignCountPerCategoryResponse<string, string>>({ requestKey: null })

  const [raw, adminCounts, roleCounts] = await Promise.all([
    categoriesPromise,
    adminCountsPromise,
    roleCountsPromise,
  ])

  const countsMap: Record<string, number> = {}
  adminCounts.forEach(sign => {
    sign.Category.forEach(catId => {
      countsMap[catId] = (countsMap[catId] ?? 0) + 1
    })
  })
  const userRoleIds = roles.value.map((r: { id: string }) => r.id)
  roleCounts.forEach(row => {
    if (row.role_id && row.category_id && userRoleIds.includes(row.role_id)) {
      countsMap[row.category_id] = (countsMap[row.category_id] ?? 0) + row.sign_count
    }
  })
  categoryCounts.value = countsMap

  categories.value = raw
    .map(parentCat => {
      if (parentCat.expand?.category_via_Parent) {
        parentCat.expand.category_via_Parent = [...parentCat.expand.category_via_Parent].sort(
          (a, b) => a.tag.localeCompare(b.tag),
        )
      }
      return parentCat
    })
    .filter(parentCat => (parentCat.expand?.category_via_Parent?.length ?? 0) > 0)
})
</script>
