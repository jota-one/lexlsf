<template>
  <router-view
    :categories="categories"
    :category-counts="categoryCounts"
    entity-label="personne"
    section="culture"
  ></router-view>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, type App } from 'vue'
import router from './router'
import useAuth from '@admin/composables/useAuth'
import type { PersonCountPerCategoryResponse, TCategory } from '@types'

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

  const adminCountsPromise = isAdmin.value
    ? pb.collection('person').getFullList({ fields: 'Category', requestKey: null })
    : Promise.resolve([])
  const roleCountsPromise = isAdmin.value
    ? Promise.resolve([])
    : pb
        .collection('person_count_per_category')
        .getFullList<PersonCountPerCategoryResponse<string, string>>({ requestKey: null })

  const [raw, adminCounts, roleCounts] = await Promise.all([
    categoriesPromise,
    adminCountsPromise,
    roleCountsPromise,
  ])

  const countsMap: Record<string, number> = {}
  adminCounts.forEach(person => {
    person.Category.forEach(catId => {
      countsMap[catId] = (countsMap[catId] ?? 0) + 1
    })
  })
  const userRoleIds = roles.value.map((r: { id: string }) => r.id)
  roleCounts.forEach(row => {
    if (row.role_id && row.category_id && userRoleIds.includes(row.role_id)) {
      countsMap[row.category_id] = (countsMap[row.category_id] ?? 0) + row.person_count
    }
  })
  categoryCounts.value = countsMap

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
        parentCat.expand?.category_via_Parent && parentCat.expand.category_via_Parent.length > 0,
    )
})
</script>
