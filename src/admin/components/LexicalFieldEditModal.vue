<template>
  <Dialog v-model:visible="visible" modal header="Modifier le champ lexical" class="w-[60%]">
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
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import LexicalFieldForm, { type LocalTerm } from './LexicalFieldForm.vue'
import useLexicalFields from '../composables/useLexicalFields'
import useLexicalTerms from '../composables/useLexicalTerms'
import type { TLexicalField } from '../../types'

type Props = { fieldId: string }
type Events = { saved: [] }
const props = defineProps<Props>()
const emit = defineEmits<Events>()
const visible = defineModel<boolean>({ required: true })

const { loadLexicalField, updateLexicalField } = useLexicalFields()
const { loadTermsByField, addTerm, updateTerm, deleteTerm } = useLexicalTerms()
const saving = ref(false)

const form = ref<TLexicalField.TForm>({ name: '', introduction: '', Roles: [] })
const terms = ref<LocalTerm[]>([])
const originalTermIds = ref<string[]>([])

watch(visible, async (isVisible) => {
  if (!isVisible) return
  const field = await loadLexicalField(props.fieldId)
  form.value = {
    id: field.id,
    name: field.name,
    slug: field.slug,
    introduction: field.introduction || '',
    Roles: field.Roles || [],
  }
  const loaded = await loadTermsByField(props.fieldId)
  terms.value = loaded.map(t => ({ id: t.id, term: t.term, Sign: t.Sign || '' }))
  originalTermIds.value = loaded.map(t => t.id)
}, { immediate: true })

const save = async () => {
  saving.value = true
  try {
    await updateLexicalField(props.fieldId, form.value)

    const currentIds = terms.value.filter(t => t.id).map(t => t.id!)
    // Delete removed terms
    for (const oldId of originalTermIds.value) {
      if (!currentIds.includes(oldId)) {
        await deleteTerm(oldId)
      }
    }
    // Create or update
    for (const t of terms.value) {
      if (!t.term.trim()) continue
      if (t.id) {
        await updateTerm(t.id, { term: t.term, LexicalField: props.fieldId, Sign: t.Sign || undefined })
      } else {
        await addTerm({ term: t.term, LexicalField: props.fieldId, Sign: t.Sign || undefined })
      }
    }

    emit('saved')
    visible.value = false
  } finally {
    saving.value = false
  }
}
</script>
