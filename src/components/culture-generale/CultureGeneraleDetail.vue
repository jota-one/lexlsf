<template>
  <transition name="fade" mode="out-in">
    <div v-if="item" :key="item.id" class="bg-base-200 rounded-2xl p-6 space-y-6">
      <!-- En-tête -->
      <div>
        <div class="flex items-start justify-between gap-4">
          <h2 class="text-2xl font-bold leading-tight">{{ item.name }}</h2>
          <button
            type="button"
            class="btn btn-sm btn-ghost btn-circle shrink-0"
            @click="close"
            title="Fermer"
          >
            <span class="i-fa-solid-times"></span>
          </button>
        </div>
        <p class="mt-1 font-mono text-sm" :class="isPeriod(item) ? 'text-secondary' : 'text-primary'">
          {{ formatDateRange(item.start_date, item.end_date) }}
          <span v-if="isPeriod(item)" class="badge badge-secondary badge-xs ml-1">période</span>
        </p>
      </div>

      <!-- Description -->
      <div v-if="item.description" class="prose prose-sm max-w-none">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <article v-html="descriptionHtml"></article>
      </div>

      <!-- Images -->
      <div v-if="item.images?.length">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="filename in item.images"
            :key="filename"
            type="button"
            class="rounded-lg overflow-hidden border border-base-300 hover:opacity-90 transition-opacity"
            @click="openLightbox(filename)"
          >
            <img
              :src="getImageUrl(item, filename, '200x150')"
              :alt="filename"
              class="w-28 h-20 object-cover"
            />
          </button>
        </div>
      </div>

      <!-- Champs lexicaux -->
      <div v-if="item.expand?.LexicalFields?.length">
        <p class="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-2">Champs lexicaux</p>
        <div class="flex flex-wrap gap-2">
          <a
            v-for="lf in item.expand.LexicalFields"
            :key="lf.id"
            :href="`/outils/champs-lexicaux/${lf.slug}`"
            class="badge badge-outline hover:badge-primary transition-colors"
          >
            {{ lf.name }}
          </a>
        </div>
      </div>

      <!-- Signes -->
      <div v-if="item.expand?.Signs?.length">
        <p class="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-2">Signes associés</p>
        <div class="flex flex-wrap gap-2">
          <a
            v-for="sign in item.expand.Signs"
            :key="sign.id"
            :href="`/lexique/sign/${sign.slug}`"
            class="badge badge-outline hover:badge-info transition-colors"
          >
            <span class="i-ic-round-sign-language mr-1 text-xs"></span>
            {{ sign.name }}
          </a>
        </div>
      </div>

      <!-- Personnes / Organismes -->
      <div v-if="item.expand?.Persons?.length">
        <p class="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-2">Personnes / Organismes</p>
        <div class="flex flex-wrap gap-2">
          <a
            v-for="person in item.expand.Persons"
            :key="person.id"
            :href="`/culture/person/${person.slug}`"
            class="badge badge-outline hover:badge-accent transition-colors"
          >
            <span class="i-fa-solid-user mr-1 text-xs"></span>
            {{ person.firstname ? `${person.firstname} ${person.name}` : person.name }}
          </a>
        </div>
      </div>
    </div>

    <div v-else class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  </transition>

  <!-- Lightbox -->
  <dialog v-if="lightboxSrc" class="modal modal-open" @click.self="lightboxSrc = ''">
    <div class="modal-box max-w-4xl p-2">
      <img :src="lightboxSrc" class="w-full rounded-lg" alt="" />
      <div class="modal-action mt-2">
        <button type="button" class="btn btn-sm" @click="lightboxSrc = ''">Fermer</button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import useGeneralCulture, { formatDateRange, isPeriod } from './composables/useGeneralCulture'
import type { TGeneralCulture } from '../../types'

const props = defineProps<{ slug: string }>()
const router = useRouter()
const { loadItem, getImageUrl } = useGeneralCulture()

const item = ref<TGeneralCulture.TRecord | null>(null)
const lightboxSrc = ref('')

const descriptionHtml = computed(() =>
  item.value?.description ? String(marked.parse(item.value.description)) : '',
)

const openLightbox = (filename: string) => {
  lightboxSrc.value = getImageUrl(item.value!, filename)
}

const close = () => router.push('/')

watch(
  () => props.slug,
  async (slug) => {
    if (!slug) return
    item.value = null
    item.value = await loadItem(slug)
  },
  { immediate: true },
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
