<template>
  <Dialog v-model:visible="visible" modal header="Ajouter un quiz" class="w-[60%]">
    <QuizForm v-model="form" :loading="saving" />
    <PbErrorToast />
    <template #footer>
      <div class="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          label="Annuler"
          severity="secondary"
          @click="visible = false"
        ></Button>
        <Button type="button" label="Créer" :loading="saving" @click="save"></Button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import QuizForm from './QuizForm.vue'
import useQuizzes from '../composables/useQuizzes'
import usePbErrorToast from '../composables/usePbErrorToast'
import PbErrorToast from './PbErrorToast.vue'

type Events = {
  saved: []
}

const emit = defineEmits<Events>()
const visible = defineModel<boolean>({ required: true })

const { createQuiz } = useQuizzes()
const { showPbError } = usePbErrorToast()

const saving = ref(false)
const form = ref({
  title: '',
  description: '',
  item_type: 'sign' as 'sign' | 'person' | 'mixed',
})

const save = async () => {
  if (!form.value.title.trim()) {
    alert('Le titre est obligatoire')
    return
  }

  saving.value = true
  try {
    await createQuiz({
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      item_type: form.value.item_type,
      settings: {},
      items: [],
    })
    emit('saved')
    visible.value = false
  } catch (error) {
    showPbError(error)
  } finally {
    saving.value = false
  }
}

watch(visible, (newVal) => {
  if (newVal) {
    // Reset form when modal opens
    form.value = {
      title: '',
      description: '',
      item_type: 'sign',
    }
  }
})
</script>
