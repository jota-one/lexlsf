<template>
  <Dialog v-model:visible="visible" modal header="Ajouter un champ lexical" class="w-[60%]">
    <LexicalFieldForm v-model="form" />
    <!-- Toast container for PocketBase errors -->
    <PbErrorToast />
    <template #footer>
      <div class="flex justify-end gap-2 pt-4">
        <Button type="button" label="Annuler" severity="secondary" @click="visible = false" />
        <Button type="button" label="Créer" :loading="saving" @click="save" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import LexicalFieldForm from './LexicalFieldForm.vue'
import useLexicalFields from '../composables/useLexicalFields'
import PbErrorToast from './PbErrorToast.vue'
import usePbErrorToast from '../composables/usePbErrorToast'
import type { TLexicalField } from '../../types'

const visible = defineModel<boolean>({ required: true })

const router = useRouter()
const { addLexicalField } = useLexicalFields()
const { showPbError } = usePbErrorToast()
const saving = ref(false)

const emptyForm = (): TLexicalField.TForm => ({
  name: '',
  introduction: '',
  Roles: [],
  Categories: [],
})

const form = ref<TLexicalField.TForm>(emptyForm())

watch(visible, isVisible => {
  if (isVisible) {
    form.value = emptyForm()
  }
})

/**
 * Terms and categories are edited on the field's own page: creating a field
 * only asks for its identity, then hands over to that page.
 */
const save = async () => {
  if (!form.value.name.trim()) {
    return
  }
  saving.value = true
  try {
    const field = (await addLexicalField(form.value)) as { id: string }
    visible.value = false
    router.push(`/lexical-fields/${field.id}/edit`)
  } catch (error) {
    showPbError(error)
  } finally {
    saving.value = false
  }
}
</script>
