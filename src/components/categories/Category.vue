<template>
    <transition name="fade">
        <div v-if="category" class="mt-6 w-full">
            <!-- Sous-catégorie active en pleine largeur -->
            <div v-if="activeSubcategory" class="mb-6">
                <div class="card bg-base-200 shadow-sm cursor-pointer transition-all duration-300 h-16 w-full"
                    @click="toggleSubcategory(activeSubcategory)">
                    <div class="card-body items-center justify-center p-0">
                        <h2 class="card-title text-lg md:text-xl">{{ subcategoryRecord?.tag }}</h2>
                    </div>
                </div>
            </div>

            <!-- Grille des sous-catégories -->
            <div v-if="!activeSubcategory" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div v-for="subcat in subCategories" :key="subcat.id"
                    class="card bg-base-200 shadow-sm cursor-pointer hover:shadow-md hover:bg-primary transition-all aspect-square"
                    @click="toggleSubcategory(subcat.slug)">
                    <div class="card-body items-center justify-center p-4">
                        <h2 class="card-title text-lg md:text-xl text-center">{{ subcat.tag }}</h2>
                    </div>
                </div>
            </div>

            <!-- Grille des signes -->
            <router-view :categories="subCategories"></router-view>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TCategory } from '../../types'
import { useRouter, useRoute } from 'vue-router';

const props = defineProps<{ category: string; categories: TCategory.TRecord[] }>()
const router = useRouter();
const route = useRoute();

const activeSubcategory = ref();

const parent = computed(() => {
    return props.categories.find(cat => cat.slug === props.category)
})

const subcategoryRecord = computed(() => {
    return subCategories.value.find(cat => cat.slug === activeSubcategory.value)
})

const subCategories = computed(() => {
    if (!parent.value) return []
    return parent.value.expand?.category_via_Parent || []
})

function toggleSubcategory(slug: string) {
    activeSubcategory.value = activeSubcategory.value === slug ? '' : slug

    if (!activeSubcategory.value) {
        return router.push({ path: `/${props.category}`, force: true })
    }
    return goToSubcategory(slug)
}

function goToSubcategory(slug: string) {
    return router.push({ path: `/${props.category}/${slug}`, force: true });
}

watch(() => route.params.subcategory, (newVal) => {
    activeSubcategory.value = newVal as string;
}, { immediate: true });

watch(() => route.params.category, (value) => {
    console.log('category changed', value);

    activeSubcategory.value = route.params.subcategory;
}, { immediate: true });
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
