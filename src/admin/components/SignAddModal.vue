<template>
    <Dialog v-model:visible="visible" modal header="Ajouter un signe" class="w-[60%]">
        <SignForm v-model="form" v-model:categories="selectedCategories" />
        <!-- Toast container for PocketBase errors -->
        <PbErrorToast />
        <template #footer>
            <div class="flex justify-end gap-2 pt-4">
                <Button type="button" label="Annuler" severity="secondary" @click="visible = false"></Button>
                <Button type="button" label="Enregistrer" :loading="saving" @click="save"></Button>
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
import PbErrorToast from './PbErrorToast.vue';
import usePbErrorToast from '../composables/usePbErrorToast';
import type { TSign } from '../../types';

type Events = {
    saved: []
};
const emit = defineEmits<Events>();

const visible = defineModel<boolean>({ required: true });

const { addSign } = useSigns();
const saving = ref(false)
const { showPbError } = usePbErrorToast();

// Store selected category for each parent
const selectedCategories = ref<{ [parentId: string]: string | null }>({});

const form = ref<TSign.TForm>({
    video: null,
    Category: [],
    name: '',
    definition: '',
    level: 1,
    verification_status: 'verified',
    ConfigurationRight: {},
    ConfigurationLeft: {},
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
    };
    try {
        await addSign(payload);
        emit('saved');
        visible.value = false;
    } catch (err) {
        // show formatted PocketBase error(s)
        showPbError(err);
    } finally {
        saving.value = false;
    }
};
</script>
