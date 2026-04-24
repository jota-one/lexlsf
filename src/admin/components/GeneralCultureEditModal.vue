<template>
  <Dialog v-model:visible="visible" modal header="Modifier l'item" class="w-[65%]">
    <GeneralCultureForm
      v-model="form"
      :existing-image-filenames="existingImageFilenames"
      :record-id="itemId"
    />
    <template #footer>
      <div class="flex justify-end gap-2 pt-4">
        <Button type="button" label="Annuler" severity="secondary" @click="visible = false" />
        <Button type="button" label="Enregistrer" :loading="saving" @click="save" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import GeneralCultureForm from './GeneralCultureForm.vue'
import useGeneralCulture, { emptyForm } from '../composables/useGeneralCulture'

type Props = { itemId: string }
type Events = { saved: [] }
const props = defineProps<Props>()
const emit = defineEmits<Events>()
const visible = defineModel<boolean>({ required: true })

const { loadItem, updateItem } = useGeneralCulture()
const saving = ref(false)

const form = ref(emptyForm())
const existingImageFilenames = ref<string[]>([])

watch(visible, async (isVisible) => {
  if (!isVisible) return
  const item = await loadItem(props.itemId)
  form.value = {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description || '',
    start_date: item.start_date || '',
    end_date: item.end_date || '',
    LexicalFields: item.LexicalFields || [],
    Signs: item.Signs || [],
    Persons: item.Persons || [],
    Roles: item.Roles || [],
    newImages: [],
    removedImages: [],
  }
  existingImageFilenames.value = item.images || []
}, { immediate: true })

const save = async () => {
  saving.value = true
  try {
    await updateItem(props.itemId, form.value)
    emit('saved')
    visible.value = false
  } finally {
    saving.value = false
  }
}
</script>
