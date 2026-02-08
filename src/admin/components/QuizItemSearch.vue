<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import dayjs from 'dayjs'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import RadioButton from 'primevue/radiobutton'
import Button from 'primevue/button'
import useQuizItemSearch from '@admin/composables/useQuizItemSearch'
import type { ItemType } from '@admin/types/quiz'

type Props = {
  itemType: ItemType
  excludeKeys?: string[]
}

type SearchResult = {
  id: string
  type: 'sign' | 'person'
  label: string
  details?: string
}

type Events = {
  select: [item: SearchResult]
  'select-all': [items: SearchResult[]]
}

const props = defineProps<Props>()
const emit = defineEmits<Events>()

const { results, loading, error, search, clear } = useQuizItemSearch()

const excludeSet = computed(() => new Set(props.excludeKeys || []))
const filteredResults = computed(() =>
  results.value.filter((item) => !excludeSet.value.has(`${item.type}:${item.id}`))
)

const hasActiveFilters = computed(
  () =>
    searchTerm.value.length > 0 ||
    !!selectedLevel.value ||
    deafFilter.value !== 'both' ||
    !!addedSince.value
)

// Search filters
const searchTerm = ref('')
const selectedLevel = ref<string>('')
const deafFilter = ref<'deaf' | 'hearing' | 'both'>('both')
const addedSince = ref('')

const levelOptions = [
  { label: 'A1', value: 'a1' },
  { label: 'A2', value: 'a2' },
  { label: 'B1', value: 'b1' },
  { label: 'B2', value: 'b2' },
  { label: 'C1', value: 'c1' },
]

const deafFilterOptions = [
  { label: 'Sourds et entendants', value: 'both' },
  { label: 'Seulement sourds', value: 'deaf' },
  { label: 'Seulement entendants', value: 'hearing' },
]

// Show/hide advanced filters based on item type
const showLevelFilter = () => props.itemType === 'sign' || props.itemType === 'mixed'
const showDeafFilter = () => props.itemType === 'person' || props.itemType === 'mixed'

const performSearch = async () => {
  const addedSinceIso = addedSince.value ? dayjs(addedSince.value).toISOString() : undefined
  await search({
    search: searchTerm.value,
    level: selectedLevel.value || undefined,
    deafFilter: deafFilter.value,
    itemType: props.itemType,
    addedSince: addedSinceIso,
  })
}

const handleClear = () => {
  searchTerm.value = ''
  selectedLevel.value = ''
  deafFilter.value = 'both'
  addedSince.value = ''
  clear()
}

const handleAddAll = () => {
  emit('select-all', filteredResults.value)
}

// Auto-search on filter changes (debounced)
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (
      searchTerm.value.length > 2 ||
      selectedLevel.value ||
      deafFilter.value !== 'both' ||
      addedSince.value
    ) {
      performSearch()
    }
  }, 300)
}

watch([searchTerm, selectedLevel, deafFilter], () => {
  debouncedSearch()
})

watch(addedSince, () => {
  debouncedSearch()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Search Term -->
    <div>
      <label class="label">
        <span class="label-text font-semibold">Rechercher</span>
      </label>
      <InputText
        v-model="searchTerm"
        class="w-full"
        placeholder="Tapez au moins 3 caractères..."
        :disabled="loading"
      />
    </div>

    <!-- Added Since Filter -->
    <div>
      <label class="label">
        <span class="label-text font-semibold">Ajouté depuis</span>
      </label>
      <InputText
        v-model="addedSince"
        type="date"
        class="w-full"
        placeholder="YYYY-MM-DD"
        :disabled="loading"
      />
    </div>

    <!-- Level Filter (Signs only or mixed) -->
    <div v-if="showLevelFilter()">
      <label class="label">
        <span class="label-text font-semibold">Niveau de difficulté</span>
      </label>
      <Select
        v-model="selectedLevel"
        :options="levelOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Tous les niveaux"
        class="w-full"
        :disabled="loading"
        showClear
      />
    </div>

    <!-- Deaf Filter (Persons only or mixed) -->
    <div v-if="showDeafFilter()" class="space-y-2">
      <label class="label">
        <span class="label-text font-semibold">Filtre par statut auditif</span>
      </label>
      <div class="space-y-2">
        <div
          v-for="option in deafFilterOptions"
          :key="option.value"
          class="flex items-center gap-2"
        >
          <RadioButton
            v-model="deafFilter"
            :value="option.value"
            :inputId="`deaf-${option.value}`"
            :disabled="loading"
          />
          <label :for="`deaf-${option.value}`" class="cursor-pointer">
            {{ option.label }}
          </label>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="filteredResults.length > 0" class="mt-6 space-y-2">
      <h3 class="text-sm font-semibold text-base-content/70">
        {{ filteredResults.length }} résultat(s)
      </h3>
      <div class="space-y-2">
        <div
          v-for="item in filteredResults"
          :key="item.id"
          class="p-3 border border-base-200 rounded-lg hover:bg-base-100/50 cursor-pointer transition"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span
                  class="badge badge-sm"
                  :class="item.type === 'sign' ? 'badge-primary' : 'badge-secondary'"
                >
                  {{ item.type === 'sign' ? 'Signe' : 'Personne' }}
                </span>
                <span class="font-semibold">{{ item.label }}</span>
              </div>
              <p v-if="item.details" class="text-xs text-base-content/60 mt-1">
                {{ item.details }}
              </p>
            </div>
            <button
              type="button"
              class="btn btn-xs btn-ghost"
              title="Ajouter au quiz"
              @click="emit('select', item)"
            >
              <span class="i-fa-solid-plus"></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <span class="loading loading-spinner loading-md"></span>
    </div>

    <!-- Error State -->
    <div v-if="error" class="alert alert-error alert-sm">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div
      v-if="!loading && filteredResults.length === 0 && hasActiveFilters"
      class="text-center py-4 text-base-content/50"
    >
      <p v-if="results.length === 0">Aucun résultat trouvé</p>
      <p v-else>Tous les résultats sont déjà dans ce quiz</p>
    </div>

    <!-- Clear Button -->
    <div v-if="filteredResults.length > 0 || searchTerm" class="flex gap-2 justify-end pt-2">
      <Button
        type="button"
        label="Effacer"
        severity="secondary"
        size="small"
        @click="handleClear"
      />
      <Button
        v-if="filteredResults.length > 1"
        type="button"
        label="Ajouter tous"
        severity="success"
        size="small"
        @click="handleAddAll"
      />
    </div>
  </div>
</template>
