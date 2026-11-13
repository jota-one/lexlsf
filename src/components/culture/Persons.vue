<template>
  <transition name="fade">
    <div v-if="subcategory" class="mt-6 w-full">
      <div>
        <div v-if="persons.length === 0" class="text-center py-10 opacity-70">
          Aucune personne trouvée.
        </div>
        <div v-else class="flex justify-end mb-3">
          <div class="join" role="group" aria-label="Affichage">
            <button
              type="button"
              class="btn btn-sm join-item"
              :class="view === 'gallery' ? 'btn-secondary' : 'btn-ghost'"
              :aria-pressed="view === 'gallery'"
              title="Galerie"
              @click="view = 'gallery'"
            >
              <span class="i-fa-solid-th-large"></span>
            </button>
            <button
              type="button"
              class="btn btn-sm join-item"
              :class="view === 'list' ? 'btn-secondary' : 'btn-ghost'"
              :aria-pressed="view === 'list'"
              title="Liste"
              @click="view = 'list'"
            >
              <span class="i-fa-solid-list"></span>
            </button>
          </div>
        </div>
        <ul
          v-if="persons.length > 0 && view === 'list'"
          class="bg-base-100 rounded-box shadow-sm divide-y divide-base-200"
        >
          <li v-for="person in persons" :key="person.id">
            <button
              type="button"
              class="w-full flex items-center justify-between gap-3 px-4 py-2 text-left cursor-pointer transition-colors"
              :class="SECTION_ACCENTS.culture.cardHover"
              @click="goToPerson(person.slug)"
            >
              <span class="flex items-center gap-3 min-w-0">
                <!-- Same width with or without a photo, so the names stay aligned. -->
                <span class="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-base-200">
                  <img
                    v-if="person.illustration"
                    :src="getIllustrationUrl(person)"
                    alt=""
                    loading="lazy"
                    class="w-full h-full object-cover"
                  />
                </span>
                <span class="font-medium truncate">{{ displayName(person) }}</span>
              </span>
              <span v-if="person.organism" class="text-xs opacity-60">Organisme</span>
            </button>
          </li>
        </ul>
        <div
          v-else-if="persons.length > 0"
          class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6"
        >
          <div
            v-for="person in persons"
            :key="person.id"
            class="card bg-base-100 shadow-sm cursor-pointer hover:shadow-md transition-all aspect-square overflow-hidden"
            :class="person.illustration ? 'group relative' : SECTION_ACCENTS.culture.cardHover"
            @click="goToPerson(person.slug)"
          >
            <template v-if="person.illustration">
              <img
                :src="getIllustrationUrl(person)"
                :alt="displayName(person)"
                class="w-full h-full object-cover"
              />
              <!-- Touch screens cannot hover: there the name stays shown. -->
              <div
                class="absolute inset-0 flex items-center justify-center p-3 bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 [@media(hover:none)]:opacity-100 [@media(hover:none)]:items-end [@media(hover:none)]:bg-linear-to-t [@media(hover:none)]:from-black/70 [@media(hover:none)]:to-transparent"
              >
                <h2 class="text-base sm:text-lg md:text-xl font-semibold text-center">
                  {{ displayName(person) }}
                </h2>
              </div>
            </template>
            <div v-else class="card-body items-center justify-center p-3 sm:p-4">
              <h2 class="card-title text-base sm:text-lg md:text-xl text-center">
                {{ displayName(person) }}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
import type { TCategory, TPerson } from '../../types'
import usePersons from '@components/culture/composables/usePersons'
import { SECTION_ACCENTS } from '@config/sectionAccents'

const props = defineProps<{ subcategory: string; categories: TCategory.TRecord[] }>()
const { loadPersons, persons, getIllustrationUrl } = usePersons()
const router = useRouter()

// Remembered per browser: whoever prefers the compact list keeps it.
const view = useLocalStorage<'gallery' | 'list'>('culture-persons-view', 'gallery')

const goToPerson = (slug: string) => {
  router.push({ path: `/person/${slug}` })
}

const displayName = (person: TPerson.TRecord) => {
  if (person.organism) {
    return person.name
  }
  return [person.firstname, person.name].filter(Boolean).join(' ')
}

watch(
  () => props.subcategory,
  value => {
    loadPersons(value)
  },
  { immediate: true },
)
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
