<template>
    <Dialog v-model:visible="visible" modal header="Ajouter un signe" class="w-[60%]">
        <SignForm v-model="form" v-model:categories="selectedCategories" />
        <template #footer>
            <div class="flex justify-end gap-2 pt-4">
                <Button type="button" label="Annuler" severity="secondary" @click="visible = false"></Button>
                <Button type="button" label="Enregistrer" @click="save"></Button>
            </div>
        </template>
    </Dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import SignForm from './SignForm.vue';
import useSigns from '../composables/useSigns';

type Events = {
    saved: []
};
const emit = defineEmits<Events>();

const visible = defineModel<boolean>({ required: true });

const { addSign } = useSigns();

// Store selected category for each parent
const selectedCategories = ref<{ [parentId: string]: string | null }>({});

const form = ref({
    video: null as File | null,
    Category: [],
    name: '',
    level: 1,
    verification_status: 'verified',
    ConfigurationRight: '',
    ConfigurationLeft: '',
    location_right: '',
    location_left: '',
    dominant_hand_movement: '',
    non_dominant_hand_movement: '',
    hand_coordination: '',
    learning_source: '',
    learning_source_detail: '',
    primary_language: 'LSF',
});

const save = async () => {
    // Collect selected category ids (one per parent)
    const selectedCategoryIds = Object.values(selectedCategories.value).filter(Boolean);
    // Add to form payload
    const payload = {
        ...form.value,
        Category: selectedCategoryIds
    };
    await addSign(payload);
    emit('saved');
    visible.value = false;
};
</script>
