<template>
    <Dialog v-model:visible="visible" modal header="Ajouter un signe" class="w-[60%]">
        <div class="flex items-center gap-4 mb-4">
            <label for="term" class="font-semibold w-40">Terme/expression</label>
            <InputText v-model="form.term" id="term" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex items-center gap-4 mb-8">
            <label for="email" class="font-semibold w-40">Email</label>
            <InputText id="email" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
            <Button type="button" label="Save" @click="save"></Button>
        </div>
    </Dialog>
</template>
<script setup lang="ts">
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { ref } from 'vue';

const visible = defineModel<boolean>({ required: true })
const form = ref({
    term: '',
    email: ''
});

const save = () => {
    // Logic to save the sign
    console.log('Saving sign:', form.value);
    visible.value = false; // Close the modal after saving

};
</script>