<template>
  <div class="space-y-2">
    <!-- Selected items -->
    <div v-if="selectedItems.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="item in selectedItems"
        :key="item.id"
        class="badge badge-primary gap-1"
      >
        {{ item.name }}
        <button type="button" @click="remove(item.id)" class="hover:opacity-70">
          <span class="i-fa-solid-times text-xs"></span>
        </button>
      </span>
    </div>

    <!-- Search input (hidden in single mode when a value is selected) -->
    <div v-if="mode === 'multi' || selectedItems.length === 0" class="relative">
      <InputText
        v-model="searchTerm"
        class="w-full"
        placeholder="Rechercher un signe..."
        autocomplete="off"
      />

      <!-- Results dropdown -->
      <div
        v-if="searchResults.length > 0"
        class="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
      >
        <button
          v-for="result in searchResults"
          :key="result.id"
          type="button"
          class="flex items-center w-full px-3 py-2 text-left hover:bg-base-200 transition-colors text-sm"
          @click="select(result)"
        >
          {{ result.name }}
        </button>
      </div>

      <!-- Loading -->
      <span
        v-if="searching"
        class="absolute right-3 top-1/2 -translate-y-1/2 loading loading-spinner loading-xs"
      ></span>

      <!-- No results -->
      <div
        v-if="searchTerm.length >= 2 && !searching && searchResults.length === 0"
        class="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-sm p-3 text-sm text-base-content/50"
      >
        Aucun signe trouvé
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import PocketBase from 'pocketbase'
import config from '../../config'

type SelectedItem = { id: string; name: string }

const props = defineProps<{
  mode: 'single' | 'multi'
}>()

const model = defineModel<string | string[]>()

const pb = new PocketBase(config.apiBaseUrl)

const searchTerm = ref('')
const searchResults = ref<SelectedItem[]>([])
const selectedItems = ref<SelectedItem[]>([])
const searching = ref(false)

const getSelectedIds = (): string[] => {
  if (!model.value) return []
  if (props.mode === 'single') return (model.value as string) ? [model.value as string] : []
  return (model.value as string[]) || []
}

onMounted(async () => {
  const ids = getSelectedIds()
  if (ids.length === 0) return
  const filter = ids.map(id => `id = "${id}"`).join(' || ')
  const res = await pb.collection('sign').getList(1, ids.length, { filter, fields: 'id,name' })
  selectedItems.value = res.items.map((s: any) => ({ id: s.id, name: s.name }))
})

let debounceTimer: ReturnType<typeof setTimeout>
watch(searchTerm, (val) => {
  clearTimeout(debounceTimer)
  if (val.length < 2) {
    searchResults.value = []
    return
  }
  debounceTimer = setTimeout(async () => {
    searching.value = true
    try {
      const selectedIds = new Set(selectedItems.value.map(s => s.id))
      const res = await pb.collection('sign').getList(1, 10, {
        filter: `name~"${val}"`,
        fields: 'id,name',
        sort: 'name',
      })
      searchResults.value = res.items
        .filter((s: any) => !selectedIds.has(s.id))
        .map((s: any) => ({ id: s.id, name: s.name }))
    } finally {
      searching.value = false
    }
  }, 300)
})

const select = (item: SelectedItem) => {
  if (props.mode === 'single') {
    selectedItems.value = [item]
    model.value = item.id
  } else {
    selectedItems.value = [...selectedItems.value, item]
    model.value = selectedItems.value.map(s => s.id)
  }
  searchTerm.value = ''
  searchResults.value = []
}

const remove = (id: string) => {
  selectedItems.value = selectedItems.value.filter(s => s.id !== id)
  if (props.mode === 'single') {
    model.value = ''
  } else {
    model.value = selectedItems.value.map(s => s.id)
  }
}
</script>
