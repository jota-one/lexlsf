<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'

type Props = {
  modelValue: {
    title: string
    description: string
    item_type: 'sign' | 'person' | 'mixed'
  }
  isEditMode?: boolean
  loading?: boolean
}

type Emits = {
  'update:modelValue': [value: Props['modelValue']]
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false,
  loading: false,
})

const emit = defineEmits<Emits>()

const form = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const itemTypeOptions = [
  { label: 'Signes', value: 'sign' },
  { label: 'Personnes', value: 'person' },
  { label: 'Mixte', value: 'mixed' },
]
</script>

<template>
  <div class="space-y-4">
    <div>
      <label class="label">
        <span class="label-text font-semibold">Titre *</span>
      </label>
      <InputText
        v-model="form.title"
        class="w-full"
        placeholder="Nom du quiz"
        :disabled="loading"
      />
    </div>

    <div>
      <label class="label">
        <span class="label-text font-semibold">Description</span>
      </label>
      <Textarea
        v-model="form.description"
        class="w-full"
        rows="3"
        placeholder="Description du quiz (optionnel)"
        :disabled="loading"
      />
    </div>

    <div>
      <label class="label">
        <span class="label-text font-semibold">Type d'éléments *</span>
      </label>
      <Select
        v-model="form.item_type"
        :options="itemTypeOptions"
        optionLabel="label"
        optionValue="value"
        class="w-full"
        :disabled="isEditMode || loading"
      />
      <p v-if="isEditMode" class="text-xs text-base-content/50 mt-1">
        Le type ne peut pas être modifié après création
      </p>
    </div>
  </div>
</template>
