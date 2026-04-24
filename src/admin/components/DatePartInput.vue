<template>
  <div class="flex items-center gap-2">
    <InputText
      v-model="year"
      placeholder="AAAA"
      class="w-24 text-center"
      maxlength="4"
      inputmode="numeric"
      :required="required"
      @input="onYearInput"
    />
    <span class="text-base-content/40">-</span>
    <select v-model="month" class="select select-bordered select-sm w-32">
      <option value="">Mois</option>
      <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
    </select>
    <span class="text-base-content/40">-</span>
    <InputText
      v-model="day"
      placeholder="JJ"
      class="w-16 text-center"
      maxlength="2"
      inputmode="numeric"
      :disabled="!month"
      @input="onDayInput"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import InputText from 'primevue/inputtext'

const props = defineProps<{ required?: boolean }>()
const model = defineModel<string>({ default: '' })

const year = ref('')
const month = ref('')
const day = ref('')

const months = [
  { value: '01', label: 'Janvier' }, { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' }, { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' }, { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' }, { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' }, { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' },
]

// Parse incoming model value into parts
watch(model, (val) => {
  if (!val) {
    year.value = ''
    month.value = ''
    day.value = ''
    return
  }
  const parts = val.split('-')
  year.value = parts[0] || ''
  month.value = parts[1] || ''
  day.value = parts[2] || ''
}, { immediate: true })

// Build model value from parts
const buildValue = () => {
  if (!year.value || year.value.length < 4) {
    model.value = ''
    return
  }
  if (!month.value) {
    model.value = year.value
    return
  }
  if (!day.value) {
    model.value = `${year.value}-${month.value}`
    return
  }
  model.value = `${year.value}-${month.value}-${day.value.padStart(2, '0')}`
}

const onYearInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
  year.value = val
  buildValue()
}

const onDayInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 2)
  day.value = val
  buildValue()
}

watch(month, (val) => {
  if (!val) day.value = ''
  buildValue()
})
</script>
