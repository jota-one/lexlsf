<template>
    <Dialog v-model:visible="visible" modal header="Modifier un signe" class="w-[60%]">
        <SignForm v-model="form" v-model:categories="selectedCategories" />
        <template #footer>
            <div class="flex justify-end gap-2 pt-4">
                <Button type="button" label="Annuler" severity="secondary" @click="visible = false"></Button>
                <Button type="button" label="Enregistrer" :loading="saving" @click="save"></Button>
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
import type { TSign } from '../../types';

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
const saving = ref(false)

// Store selected category for each parent
const selectedCategories = ref<{ [parentId: string]: string | null }>({});

const form = ref<TSign.TForm>({
    Category: [],
    name: '',
    level: 1,
    verification_status: 'verified',
    ConfigurationRight: {},
    ConfigurationLeft: {},
    dominant_hand_movement: '',
    non_dominant_hand_movement: '',
    hand_coordination: '',
    learning_source: '',
    learning_source_detail: '',
    primary_language: 'LSF',
    placement: {
        right: [] as string[],
        left: [] as string[]
    }
});

const save = async () => {
    saving.value = true;
    // Collect selected category ids (one per parent)
    const selectedCategoryIds = Object.values(selectedCategories.value).filter(Boolean);
    // Add to form payload
    const payload = {
        ...form.value,
        Category: selectedCategoryIds,
        ConfigurationRight: form.value.ConfigurationRight.id || undefined,
        ConfigurationLeft: form.value.ConfigurationLeft.id || undefined
    };
    await updateSign(props.signId, payload);
    emit('saved');
    visible.value = false;
    saving.value = false;
};

watch(visible, async (isVisible) => {
    if (!isVisible) {
        return;
    }
    const sign = await loadSign(props.signId);

    form.value = {
        Category: sign.Category || [],
        name: sign.name,
        level: getNumericLevel(sign.level),
        verification_status: sign.verification_status,
        ConfigurationRight: sign.expand?.ConfigurationRight || {},
        ConfigurationLeft: sign.expand?.ConfigurationLeft || {},
        dominant_hand_movement: sign.dominant_hand_movement,
        non_dominant_hand_movement: sign.non_dominant_hand_movement,
        hand_coordination: sign.hand_coordination,
        learning_source: sign.learning_source,
        learning_source_detail: sign.learning_source_detail,
        primary_language: sign.primary_language || 'LSF',
        placement: sign.placement
    };
    // Initialize selected categories
    selectedCategories.value = {};
    (sign.expand?.Category || []).forEach(cat => {
        selectedCategories.value[cat.Parent!] = cat.id;
    });
}, { immediate: true });
</script>
