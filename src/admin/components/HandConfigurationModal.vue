<template>
    <Dialog v-model:visible="visible" modal header="Ajouter une configuration de main" class="w-[60%]">
        <form @submit.prevent="save" class="space-y-4">
            <!-- Nom -->
            <div class="flex items-center gap-4">
                <label for="name" class="font-semibold w-40">Nom</label>
                <InputText v-model="form.name" id="name" class="w-full" required />
            </div>
            <!-- Illustration -->
            <div class="flex items-center gap-4">
                <label for="illustration" class="font-semibold w-40">Illustration</label>
                <input type="file" id="illustration" class="file-input file-input-bordered w-full"
                    @change="onFileChange" />
            </div>
            <div class="flex justify-end gap-2 pt-4">
                <Button type="button" label="Annuler" severity="secondary" @click="visible = false"></Button>
                <Button type="submit" label="Enregistrer"></Button>
            </div>
        </form>
    </Dialog>
</template>
<script setup lang="ts">
// filepath: /Users/joelpoulin/Sites/astro/lexlsf/src/admin/components/HandConfigurationModal.vue
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import useHandConfigurations from '../composables/useHandConfigurations';

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

const onFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    form.value.illustration = target.files && target.files.length > 0 ? target.files[0] : null;
};

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
