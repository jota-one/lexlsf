<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PocketBase from 'pocketbase'
import config from '../../config'
import Button from 'primevue/button'
import usePbErrorToast from '@admin/composables/usePbErrorToast'

type Props = {
  quizId: string
  itemType: 'sign' | 'person' | 'mixed'
}

type QuizItemDisplay = {
  id: string
  position: number
  itemType: 'sign' | 'person'
  itemId: string
  label: string
  details?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  delete: []
  loaded: [string[]]
}>()

const pb = new PocketBase(config.apiBaseUrl)
const { showPbError } = usePbErrorToast()

const items = ref<QuizItemDisplay[]>([])
const loading = ref(false)

onMounted(async () => {
  await loadItems()
})

const loadItems = async () => {
  loading.value = true
  try {
    const quizItems = await pb
      .collection('quiz_item')
      .getFullList({
        filter: `Quiz = "${props.quizId}"`,
        expand: 'Quiz,Item',
        sort: '+position',
      })

    items.value = await Promise.all(
      quizItems.map(async (item) => {
        const itemType = item.item_type as 'sign' | 'person'
        const collection = itemType === 'sign' ? 'sign' : 'person'

        // Fetch the actual item data
        const itemData = await pb.collection(collection).getOne(item.item_id)

        const label =
          itemType === 'sign'
            ? itemData.name
            : itemData.firstname
              ? `${itemData.firstname} ${itemData.name}`
              : itemData.name

        return {
          id: item.id,
          position: item.position,
          itemType,
          itemId: item.item_id,
          label,
          details: itemType === 'sign' ? itemData.definition : itemData.description,
        }
      })
    )
    emit('loaded', items.value.map((i) => `${i.itemType}:${i.itemId}`))
  } catch (error) {
    showPbError(error)
  } finally {
    loading.value = false
  }
}

const deleteItem = async (itemId: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément du quiz?')) return

  try {
    await pb.collection('quiz_item').delete(itemId)
    items.value = items.value.filter((i) => i.id !== itemId)
    emit('delete')
    emit('loaded', items.value.map((i) => `${i.itemType}:${i.itemId}`))
  } catch (error) {
    showPbError(error)
  }
}
</script>

<template>
  <div class="space-y-2">
    <div v-if="loading" class="text-center py-4">
      <span class="loading loading-spinner loading-md"></span>
    </div>

    <div v-else-if="items.length === 0" class="text-center py-8 text-base-content/50">
      <p>Aucun élément dans ce quiz pour le moment</p>
      <p class="text-sm mt-2">Utilisez la section ci-dessous pour en ajouter</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="flex items-start gap-3 p-3 border border-base-200 rounded-lg hover:bg-base-100/50 transition"
      >
        <div
          class="flex-none w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold"
        >
          {{ index + 1 }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span
              class="badge badge-sm"
              :class="item.itemType === 'sign' ? 'badge-primary' : 'badge-secondary'"
            >
              {{ item.itemType === 'sign' ? 'Signe' : 'Personne' }}
            </span>
            <span class="font-semibold truncate">{{ item.label }}</span>
          </div>
          <p v-if="item.details" class="text-xs text-base-content/60 mt-1 line-clamp-2">
            {{ item.details }}
          </p>
        </div>
        <Button
          icon="i-fa-solid-trash"
          severity="danger"
          text
          size="small"
          @click="deleteItem(item.id)"
        />
      </div>
    </div>
  </div>
</template>
