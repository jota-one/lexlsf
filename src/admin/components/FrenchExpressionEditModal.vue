<template>
  <Dialog v-model:visible="visible" modal header="Modifier l'expression française" class="w-[55%]">
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
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import FrenchExpressionForm from './FrenchExpressionForm.vue'
import useFrenchExpressions from '../composables/useFrenchExpressions'
import type { TFrenchExpression } from '../../types'

type Props = { expressionId: string }
type Events = { saved: [] }
const props = defineProps<Props>()
const emit = defineEmits<Events>()
const visible = defineModel<boolean>({ required: true })

const { loadFrenchExpression, updateFrenchExpression } = useFrenchExpressions()
const saving = ref(false)

const form = ref<TFrenchExpression.TForm>({ expression: '', strategies: '', Signs: [], Roles: [] })

watch(visible, async (isVisible) => {
  if (!isVisible) return
  const record = await loadFrenchExpression(props.expressionId)
  form.value = {
    id: record.id,
    expression: record.expression,
    slug: record.slug,
    strategies: record.strategies || '',
    Signs: record.Signs || [],
    Roles: record.Roles || [],
  }
}, { immediate: true })

const save = async () => {
  saving.value = true
  try {
    await updateFrenchExpression(props.expressionId, form.value)
    emit('saved')
    visible.value = false
  } finally {
    saving.value = false
  }
}
</script>
