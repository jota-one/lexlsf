<template>
    <Dialog v-model:visible="visible" modal header="Ajouter une configuration de main" class="w-[60%]">
        <HandConfigurationForm v-model="form" />
        <div class="flex justify-end gap-2 pt-4">
            <Button type="button" label="Annuler" severity="secondary" @click="visible = false"></Button>
            <Button type="button" label="Enregistrer" @click="save"></Button>
        </div>
    </Dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import useHandConfigurations from '../composables/useHandConfigurations';
import HandConfigurationForm from './HandConfigurationForm.vue';

type Events = {
    saved: []
};

const emit = defineEmits<Events>();
const visible = defineModel<boolean>({ required: true });

const { addHandConfiguration } = useHandConfigurations();

const form = ref({
    name: '',
    illustration: null as File | null
});

const save = async () => {
    await addHandConfiguration(form.value);
    emit('saved');
    visible.value = false; // Close the modal after saving
    form.value = {
        name: '',
        illustration: null
    }; // Reset the form
};
</script>
