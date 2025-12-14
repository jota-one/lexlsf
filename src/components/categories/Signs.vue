<template>
  <transition name="fade">
    <div v-if="subcategory" class="mt-6 w-full">
      <div>
        <div v-if="signs.length === 0" class="text-center py-10 opacity-70">
          Aucun signe trouvé.
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div
            v-for="sign in signs"
            :key="sign.id"
            class="card bg-base-100 shadow-sm cursor-pointer hover:shadow-md hover:bg-primary transition-all aspect-square"
            @click="goToSign(sign.slug)"
          >
            <div class="card-body items-center justify-center p-4">
              <h2 class="card-title text-lg md:text-xl text-center">{{ sign.name }}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import type { TSign, TCategory } from '../../types'
import useSigns from '@components/categories/composables/useSigns';

const props = defineProps<{ subcategory: string; categories: TCategory.TRecord[] }>()
const { loadSigns, signs } = useSigns();

function goToSign(slug: string) {
    window.location.href = `/signs/${slug}`
}

watch(() => props.subcategory, (value) => {
    loadSigns(value);
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
