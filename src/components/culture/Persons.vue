<template>
  <transition name="fade">
    <div v-if="subcategory" class="mt-6 w-full">
      <div>
        <div v-if="persons.length === 0" class="text-center py-10 opacity-70">
          Aucun signe trouvé.
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div
            v-for="person in persons"
            :key="person.id"
            class="card bg-base-100 shadow-sm cursor-pointer hover:shadow-md hover:bg-primary transition-all"
            @click="goToPerson(person.slug)"
          >
            <figure v-if="person.illustration" class="aspect-square overflow-hidden">
              <img
                :src="getIllustrationUrl(person)"
                :alt="person.name"
                class="w-full h-full object-cover"
              />
            </figure>
            <div
              class="card-body items-center justify-center p-4"
              :class="{ 'aspect-square': !person.illustration }"
            >
              <h2 class="card-title text-lg md:text-xl text-center">{{ person.name }}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import type { TCategory } from '../../types'
import usePersons from '@components/culture/composables/usePersons';

const props = defineProps<{ subcategory: string; categories: TCategory.TRecord[] }>()
const { loadPersons, persons, getIllustrationUrl } = usePersons();

const goToPerson = (slug: string) => {
    window.location.href = `/persons/${slug}`
}

watch(() => props.subcategory, (value) => {
    loadPersons(value);
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
