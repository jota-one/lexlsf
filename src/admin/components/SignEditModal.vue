<template>
    <Dialog v-model:visible="visible" modal header="Modifier un signe" class="w-[60%]">
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
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import SignForm from './SignForm.vue';
import useSigns from '../composables/useSigns';

type Props = {
    signId: string
}
type Events = {
    saved: []
};
const props = defineProps<Props>();
const emit = defineEmits<Events>();

const visible = defineModel<boolean>({ required: true });

const { updateSign, loadSign, getNumericLevel } = useSigns();

// Store selected category for each parent
const selectedCategories = ref<{ [parentId: string]: string | null }>({});

const form = ref({
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
    await updateSign(props.signId, payload);
    emit('saved');
    visible.value = false;
};

watch(visible, async (isVisible) => {
    if (!isVisible) {
        return;
    }
    const sign = await loadSign(props.signId);
    console.log('sign', sign);

    form.value = {
        Category: sign.Category || [],
        name: sign.name,
        level: getNumericLevel(sign.level),
        verification_status: sign.verification_status,
        ConfigurationRight: sign.ConfigurationRight || '',
        ConfigurationLeft: sign.ConfigurationLeft || '',
        location_right: sign.location_right,
        location_left: sign.location_left,
        dominant_hand_movement: sign.dominant_hand_movement,
        non_dominant_hand_movement: sign.non_dominant_hand_movement,
        hand_coordination: sign.hand_coordination,
        learning_source: sign.learning_source,
        learning_source_detail: sign.learning_source_detail,
        primary_language: sign.primary_language || 'LSF',
    };
    // Initialize selected categories
    selectedCategories.value = {};
    (sign.expand?.Category || []).forEach(cat => {
        selectedCategories.value[cat.Parent] = cat.id;
    });
}, { immediate: true });
</script>
