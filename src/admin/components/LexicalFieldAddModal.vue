<template>
  <Dialog v-model:visible="visible" modal header="Ajouter un champ lexical" class="w-[60%]">
    <LexicalFieldForm v-model="form" v-model:terms="terms" />
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
import LexicalFieldForm, { type LocalTerm } from './LexicalFieldForm.vue'
import useLexicalFields from '../composables/useLexicalFields'
import useLexicalTerms from '../composables/useLexicalTerms'
import type { TLexicalField } from '../../types'

type Events = { saved: [] }
const emit = defineEmits<Events>()
const visible = defineModel<boolean>({ required: true })

const { addLexicalField } = useLexicalFields()
const { addTerm } = useLexicalTerms()
const saving = ref(false)

const form = ref<TLexicalField.TForm>({ name: '', introduction: '', Roles: [] })
const terms = ref<LocalTerm[]>([])

const save = async () => {
  saving.value = true
  try {
    const field = await addLexicalField(form.value) as any
    for (const t of terms.value) {
      if (t.term.trim()) {
        await addTerm({ term: t.term, LexicalField: field.id, Sign: t.Sign || undefined })
      }
    }
    emit('saved')
    visible.value = false
    form.value = { name: '', introduction: '', Roles: [] }
    terms.value = []
  } finally {
    saving.value = false
  }
}
</script>
