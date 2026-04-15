<template>
  <Dialog v-model:visible="visible" modal header="Ajouter une expression pi-sourde" class="w-[55%]">
    <PiDeafExpressionForm v-model="form" />
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
import PiDeafExpressionForm from './PiDeafExpressionForm.vue'
import usePiDeafExpressions from '../composables/usePiDeafExpressions'
import PocketBase from 'pocketbase'
import config from '../../config'
import type { TPiDeafExpression } from '../../types'

type Events = { saved: [] }
const emit = defineEmits<Events>()
const visible = defineModel<boolean>({ required: true })

const { addPiDeafExpression } = usePiDeafExpressions()
const saving = ref(false)

const form = ref<TPiDeafExpression.TForm>({ Sign: '', strategies: '', Roles: [] })

// Auto-populate name from selected sign
const pb = new PocketBase(config.apiBaseUrl)
watch(() => form.value.Sign, async (signId) => {
  if (!signId) return
  const sign = await pb.collection('sign').getOne(signId, { fields: 'id,name' }) as any
  form.value.name = sign.name
})

const save = async () => {
  saving.value = true
  try {
    await addPiDeafExpression(form.value)
    emit('saved')
    visible.value = false
    form.value = { Sign: '', strategies: '', Roles: [] }
  } finally {
    saving.value = false
  }
}
</script>
