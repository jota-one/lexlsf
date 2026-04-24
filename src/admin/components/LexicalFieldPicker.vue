<template>
  <div class="space-y-2">
    <div v-if="selectedItems.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="item in selectedItems"
        :key="item.id"
        class="badge badge-secondary gap-1"
      >
        {{ item.name }}
        <button type="button" @click="remove(item.id)" class="hover:opacity-70">
          <span class="i-fa-solid-times text-xs"></span>
        </button>
      </span>
    </div>

    <div class="relative">
      <InputText
        v-model="searchTerm"
        class="w-full"
        placeholder="Rechercher un champ lexical..."
        autocomplete="off"
      />

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

      <span
        v-if="searching"
        class="absolute right-3 top-1/2 -translate-y-1/2 loading loading-spinner loading-xs"
      ></span>

      <div
        v-if="searchTerm.length >= 2 && !searching && searchResults.length === 0"
        class="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-sm p-3 text-sm text-base-content/50"
      >
        Aucun champ lexical trouvé
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import PocketBase from 'pocketbase'
import config from '../../config'

type Item = { id: string; name: string }

const model = defineModel<string[]>({ default: () => [] })

const pb = new PocketBase(config.apiBaseUrl)
const searchTerm = ref('')
const searchResults = ref<Item[]>([])
const selectedItems = ref<Item[]>([])
const searching = ref(false)

onMounted(async () => {
  if (!model.value?.length) return
  const filter = model.value.map(id => `id = "${id}"`).join(' || ')
  const res = await pb.collection('lexical_field').getList(1, model.value.length, {
    filter,
    fields: 'id,name',
  })
  selectedItems.value = res.items.map((f: any) => ({ id: f.id, name: f.name }))
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
      const res = await pb.collection('lexical_field').getList(1, 10, {
        filter: `name~"${val}"`,
        fields: 'id,name',
        sort: 'name',
      })
      searchResults.value = res.items
        .filter((f: any) => !selectedIds.has(f.id))
        .map((f: any) => ({ id: f.id, name: f.name }))
    } finally {
      searching.value = false
    }
  }, 300)
})

const select = (item: Item) => {
  selectedItems.value = [...selectedItems.value, item]
  model.value = selectedItems.value.map(s => s.id)
  searchTerm.value = ''
  searchResults.value = []
}

const remove = (id: string) => {
  selectedItems.value = selectedItems.value.filter(s => s.id !== id)
  model.value = selectedItems.value.map(s => s.id)
}
</script>
