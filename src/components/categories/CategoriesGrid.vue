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
        v-for="cat in parentCategories"
        :key="cat.id"
        class="card bg-base-300 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:bg-primary aspect-square"
        @click="toggleParent(cat.slug)"
      >
        <div class="card-body items-center justify-center p-4">
          <h2 class="card-title text-xl md:text-2xl text-center">{{ cat.tag }}</h2>
        </div>
      </div>
    </div>

    <!-- Grille des sous-catégories -->
    <router-view :categories="categories"></router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TCategory } from '../../types'
import { useRoute, useRouter } from 'vue-router';

const props = defineProps<{ categories: TCategory.TRecord[] }>()
const router = useRouter();
const route = useRoute();

const activeParent = ref<string>(route.params.category as string);
const parentCategories = computed(() => props.categories.filter(cat => !cat.Parent))
const parent = computed(() => {
    return props.categories.find(cat => cat.slug === activeParent.value)
})

function toggleParent(slug: string) {
    activeParent.value = activeParent.value === slug ? '' : slug

    if (!activeParent.value) {
        return router.push({ path: '/', force: true })
    }
    return goToCategory(slug)
}
function goToCategory(slug: string) {
    return router.push({ path: `${slug}`, force: true });
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
