<template>
  <Dialog v-model:visible="visible" modal header="Ajouter une expression française" class="w-[55%]">
    <FrenchExpressionForm v-model="form" />
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
import FrenchExpressionForm from './FrenchExpressionForm.vue'
import useFrenchExpressions from '../composables/useFrenchExpressions'
import type { TFrenchExpression } from '../../types'

type Events = { saved: [] }
const emit = defineEmits<Events>()
const visible = defineModel<boolean>({ required: true })

const { addFrenchExpression } = useFrenchExpressions()
const saving = ref(false)

const form = ref<TFrenchExpression.TForm>({ expression: '', strategies: '', Signs: [], Roles: [] })

const save = async () => {
  saving.value = true
  try {
    await addFrenchExpression(form.value)
    emit('saved')
    visible.value = false
    form.value = { expression: '', strategies: '', Signs: [], Roles: [] }
  } finally {
    saving.value = false
  }
}
</script>
