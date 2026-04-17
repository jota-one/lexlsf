<template>
  <div class="w-full">
    <!-- Catégorie parente active en pleine largeur -->
    <div v-if="activeParent" class="mb-6">
      <div
        class="card bg-base-300 shadow-sm cursor-pointer transition-all duration-300 h-16 w-full"
        @click="toggleParent(activeParent)"
      >
        <div class="card-body items-center justify-center p-0">
          <h2 class="card-title text-xl md:text-2xl">{{ parent?.tag }}</h2>
        </div>
      </div>
    </div>

    <!-- Grille des catégories parentes -->
    <div v-if="!activeParent" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <div
        v-for="cat in visibleParentCategories"
        :key="cat.id"
        class="card bg-base-300 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:bg-primary aspect-square"
        @click="toggleParent(cat.slug)"
      >
        <div class="card-body items-center justify-center p-4 gap-2">
          <h2 class="card-title text-xl md:text-2xl text-center">{{ cat.tag }}</h2>
          <span v-if="categoryCounts" class="badge badge-sm bg-base-content/10 border-0">
            {{ signLabel(parentCount(cat)) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Grille des sous-catégories -->
    <router-view :categories="categories" :category-counts="categoryCounts" :entity-label="entityLabel"></router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TCategory } from '../../types'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps<{
  categories: TCategory.TRecord[]
  categoryCounts?: Record<string, number>
  entityLabel?: string
}>()
const router = useRouter()
const route = useRoute()

const activeParent = ref<string>(route.params.category as string)
const parentCategories = computed(() => props.categories.filter(cat => !cat.Parent))
const parent = computed(() => props.categories.find(cat => cat.slug === activeParent.value))

const signLabel = (count: number) => {
  const label = props.entityLabel ?? 'signe'
  const plural = props.entityLabel ? `${label}s` : 'signes'
  return `${count} ${count === 1 ? label : plural}`
}

const parentCount = (cat: TCategory.TRecord): number =>
  (cat.expand?.category_via_Parent ?? []).reduce(
    (sum: number, subCat: TCategory.TRecord) => sum + (props.categoryCounts?.[subCat.id] ?? 0),
    0,
  )

const visibleParentCategories = computed(() => {
  if (!props.categoryCounts) return parentCategories.value
  return parentCategories.value.filter(cat => parentCount(cat) > 0)
})

function toggleParent(slug: string) {
  activeParent.value = activeParent.value === slug ? '' : slug
  if (!activeParent.value) {
    return router.push({ path: '/', force: true })
  }
  return goToCategory(slug)
}
function goToCategory(slug: string) {
  return router.push({ path: `${slug}`, force: true })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
