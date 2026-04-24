<template>
  <div class="pt-24 pb-16 container mx-auto px-4">
    <!-- Titre -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Culture générale</h1>
      <p class="text-base-content/60 mt-1">Chronologie des événements et périodes</p>
    </div>

    <!-- Filtres -->
    <div class="flex flex-wrap gap-4 mb-8 p-4 bg-base-200 rounded-xl">
      <div class="flex items-center gap-2">
        <label class="text-sm font-semibold">Type</label>
        <div class="flex gap-1">
          <button
            v-for="opt in typeOptions"
            :key="opt.value"
            type="button"
            class="btn btn-sm"
            :class="filterType === opt.value ? 'btn-primary' : 'btn-ghost'"
            @click="filterType = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm font-semibold">De</label>
        <input
          v-model="filterFrom"
          type="number"
          min="1"
          max="9999"
          placeholder="Année"
          class="input input-bordered input-sm w-24"
        />
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm font-semibold">À</label>
        <input
          v-model="filterTo"
          type="number"
          min="1"
          max="9999"
          placeholder="Année"
          class="input input-bordered input-sm w-24"
        />
      </div>
      <button v-if="isFiltered" type="button" class="btn btn-sm btn-ghost" @click="resetFilters">
        <span class="i-fa-solid-times mr-1"></span>
        Réinitialiser
      </button>
      <span class="text-sm text-base-content/50 self-center ml-auto">{{ filteredItems.length }} résultat(s)</span>
    </div>

    <!-- Contenu principal : timeline + panneau détail -->
    <div class="flex gap-8 items-start">
      <!-- Timeline -->
      <div :class="activeSlug ? 'w-2/5 shrink-0' : 'w-full'" class="transition-all duration-300">
        <div v-if="loading" class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else-if="filteredItems.length === 0" class="text-center py-16 text-base-content/50">
          Aucun élément trouvé.
        </div>

        <ul v-else class="relative border-l-2 border-base-300 ml-4 space-y-0">
          <li
            v-for="item in filteredItems"
            :key="item.id"
            class="relative pl-8 pb-8 cursor-pointer group"
            @click="navigateTo(item)"
          >
            <!-- Cercle sur la ligne -->
            <div
              class="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 transition-colors"
              :class="activeSlug === item.slug
                ? 'bg-primary border-primary'
                : isPeriod(item)
                  ? 'bg-base-100 border-secondary group-hover:border-secondary group-hover:bg-secondary/20'
                  : 'bg-base-100 border-primary group-hover:border-primary group-hover:bg-primary/20'"
            ></div>

            <!-- Date -->
            <span
              class="text-xs font-mono font-semibold mb-1 block"
              :class="isPeriod(item) ? 'text-secondary' : 'text-primary'"
            >
              {{ formatDateRange(item.start_date, item.end_date) }}
              <span v-if="isPeriod(item)" class="badge badge-secondary badge-xs ml-1">période</span>
            </span>

            <!-- Titre -->
            <p
              class="font-semibold leading-tight transition-colors"
              :class="activeSlug === item.slug ? 'text-primary' : 'group-hover:text-primary'"
            >
              {{ item.name }}
            </p>
          </li>
        </ul>
      </div>

      <!-- Panneau détail (router-view) -->
      <div v-if="activeSlug" class="flex-1 sticky top-24">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'
import useGeneralCulture, { formatDateRange, isPeriod } from './composables/useGeneralCulture'
import type { TGeneralCulture } from '../../types'

const { loadItems } = useGeneralCulture()
const route = useRoute()
const router = useRouter()

const items = ref<TGeneralCulture.TRecord[]>([])
const loading = ref(true)

const filterType = ref<'all' | 'event' | 'period'>('all')
const filterFrom = ref<number | ''>('')
const filterTo = ref<number | ''>('')

const typeOptions = [
  { value: 'all', label: 'Tout' },
  { value: 'event', label: 'Événements' },
  { value: 'period', label: 'Périodes' },
]

const activeSlug = computed(() => route.params.slug as string | undefined)

const isFiltered = computed(
  () => filterType.value !== 'all' || filterFrom.value !== '' || filterTo.value !== '',
)

const filteredItems = computed(() => {
  return items.value.filter(item => {
    if (filterType.value === 'event' && isPeriod(item)) return false
    if (filterType.value === 'period' && !isPeriod(item)) return false
    const startYear = parseInt(item.start_date.split('-')[0])
    if (filterFrom.value !== '' && startYear < Number(filterFrom.value)) return false
    if (filterTo.value !== '' && startYear > Number(filterTo.value)) return false
    return true
  })
})

const resetFilters = () => {
  filterType.value = 'all'
  filterFrom.value = ''
  filterTo.value = ''
}

const navigateTo = (item: TGeneralCulture.TRecord) => {
  if (activeSlug.value === item.slug) {
    router.push('/')
  } else {
    router.push(`/${item.slug}`)
  }
}

onMounted(async () => {
  try {
    items.value = await loadItems()
  } finally {
    loading.value = false
  }
})
</script>
