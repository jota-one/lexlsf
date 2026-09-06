<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Terme -->
    <div>
      <label class="text-xs text-base-content/50 mb-1 block">Terme</label>
      <InputText v-model="form.term" class="w-full" placeholder="Terme français..." />
    </div>

    <!-- Type -->
    <div>
      <label class="text-xs text-base-content/50 mb-1 block">Type</label>
      <Select
        v-model="form.Type"
        :options="types"
        optionLabel="tag"
        optionValue="id"
        placeholder="Aucun type"
        class="w-full"
        show-clear
      />
    </div>

    <!-- Stratégie -->
    <div>
      <label class="text-xs text-base-content/50 mb-1 block">Stratégie</label>
      <textarea
        v-model="form.strategy"
        class="textarea textarea-bordered w-full text-sm"
        rows="3"
        placeholder="Stratégie..."
      ></textarea>
    </div>

    <!-- Note personnelle -->
    <div>
      <label class="text-xs text-base-content/50 mb-1 block">Note personnelle</label>
      <textarea
        v-model="form.note"
        class="textarea textarea-bordered w-full text-sm"
        rows="3"
        placeholder="Note personnelle..."
      ></textarea>
    </div>

    <!-- Signe associé -->
    <div>
      <label class="text-xs text-base-content/50 mb-1 block">Signe associé</label>
      <SignPicker mode="single" v-model="signModel" />
    </div>

    <!-- Termes liés -->
    <div>
      <label class="text-xs text-base-content/50 mb-1 block">Termes liés</label>
      <MultiSelect
        v-model="form.RelatedTerms"
        :options="linkableTerms"
        optionLabel="label"
        optionValue="id"
        filter
        display="chip"
        placeholder="Aucun terme lié"
        class="w-full"
        :maxSelectedLabels="3"
      />
      <p class="text-xs text-base-content/40 mt-1">
        Les liens sont réciproques : l'autre terme pointera aussi vers celui-ci.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import SignPicker from './SignPicker.vue'
import type { TCategory, TLexicalTerm } from '../../types'

type Props = {
  types: TCategory.TRecord[]
  allTerms: TLexicalTerm.TRecord[]
  currentId?: string
}
const props = defineProps<Props>()

const form = defineModel<TLexicalTerm.TForm>({ required: true })

// SignPicker's model is typed for both of its modes
const signModel = computed<string | string[] | undefined>({
  get: () => form.value.Sign,
  set: value => (form.value.Sign = (value as string) || ''),
})

const linkableTerms = computed(() =>
  props.allTerms
    .filter(term => term.id !== props.currentId)
    .map(term => ({
      id: term.id,
      label: term.expand?.LexicalField
        ? `${term.term} — ${term.expand.LexicalField.name}`
        : term.term,
    })),
)
</script>
