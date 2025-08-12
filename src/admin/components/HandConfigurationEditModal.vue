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
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import useHandConfigurations from '../composables/useHandConfigurations';
import HandConfigurationForm from './HandConfigurationForm.vue';

type Props = {
    id: string
}
type Events = {
    saved: []
};

const props = defineProps<Props>();
const emit = defineEmits<Events>();
const visible = defineModel<boolean>({ required: true });

const { updateHandConfiguration, loadHandConfiguration } = useHandConfigurations();

const form = ref({
    name: '',
    illustration: null as File | null
});

const save = async () => {
    await updateHandConfiguration(props.id, form.value);
    emit('saved');
    visible.value = false; // Close the modal after saving
    form.value = {
        name: '',
        illustration: null
    }; // Reset the form
};

watch(visible, async (isVisible) => {
    if (!isVisible) {
        return;
    }
    // Load the existing configuration data when modal opens
    const handConfiguration = await loadHandConfiguration(props.id);
    form.value = {
        name: handConfiguration.name,
        illustration: handConfiguration.illustration || null
    };
});
</script>
