<template>
  <Dialog v-model:visible="visible" modal header="Ajouter un item" class="w-[65%]">
    <GeneralCultureForm v-model="form" />
    <template #footer>
      <div class="flex justify-end gap-2 pt-4">
        <Button type="button" label="Annuler" severity="secondary" @click="visible = false" />
        <Button type="button" label="Enregistrer" :loading="saving" @click="save" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import GeneralCultureForm from './GeneralCultureForm.vue'
import useGeneralCulture, { emptyForm } from '../composables/useGeneralCulture'

type Events = { saved: [] }
const emit = defineEmits<Events>()
const visible = defineModel<boolean>({ required: true })

const { addItem } = useGeneralCulture()
const saving = ref(false)

const form = ref<TGeneralCulture.TForm>(emptyForm())

const save = async () => {
  saving.value = true
  try {
    await addItem(form.value)
    emit('saved')
    visible.value = false
    form.value = emptyForm()
  } finally {
    saving.value = false
  }
}
</script>
