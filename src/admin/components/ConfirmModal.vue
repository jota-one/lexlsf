<template>
  <Dialog v-model:visible="visible" modal :header="title" class="w-[24rem]">
    <div class="py-4">
      <p>{{ message }}</p>
    </div>
    <div class="flex justify-end gap-2 pt-4">
      <Button type="button" label="Annuler" severity="secondary" @click="visible = false"></Button>
      <!-- Confirming is the intent in almost every case: PrimeVue's Dialog focuses
           the `[autofocus]` element on open, so Enter confirms without tabbing. -->
      <Button type="button" label="Confirmer" severity="danger" autofocus @click="confirm"></Button>
    </div>
  </Dialog>
</template>
<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

type Props = {
  title: string
  message: string
}
defineProps<Props>()

const emit = defineEmits<{
  (e: 'confirm'): void
}>()

const visible = defineModel<boolean>({ required: true })

const confirm = () => {
  emit('confirm')
  visible.value = false
}
</script>
