<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="itemId ? `Modifier l'item` : 'Ajouter un item'"
    class="w-[65%]"
  >
    <GeneralCultureForm
      v-model="form"
      :existing-image-filenames="existingImageFilenames"
      :record-id="itemId"
    />
    <!-- Toast container for PocketBase errors -->
    <PbErrorToast />
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
import PbErrorToast from './PbErrorToast.vue'
import usePbErrorToast from '../composables/usePbErrorToast'

type Props = {
  // undefined = create mode
  itemId?: string
}
type Events = { saved: [] }
const props = defineProps<Props>()
const emit = defineEmits<Events>()
const visible = defineModel<boolean>({ required: true })

const { addItem, loadItem, updateItem } = useGeneralCulture()
const saving = ref(false)
const { showPbError } = usePbErrorToast()

const form = ref(emptyForm())
const existingImageFilenames = ref<string[]>([])

watch(visible, async (isVisible) => {
  if (!isVisible) {return}
  if (!props.itemId) {
    // Reset form when modal is opened in create mode
    form.value = emptyForm()
    existingImageFilenames.value = []
    return
  }
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
    if (props.itemId) {
      await updateItem(props.itemId, form.value)
    } else {
      await addItem(form.value)
    }
    emit('saved')
    visible.value = false
  } catch (err) {
    // show formatted PocketBase error(s)
    showPbError(err)
  } finally {
    saving.value = false
  }
}
</script>
