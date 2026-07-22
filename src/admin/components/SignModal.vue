<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="signId ? 'Modifier un signe' : 'Ajouter un signe'"
    class="w-[60%]"
  >
    <SignForm v-model="form" v-model:categories="selectedCategories" />
    <!-- Toast container for PocketBase errors -->
    <PbErrorToast />
    <template #footer>
      <div class="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          label="Annuler"
          severity="secondary"
          @click="visible = false"
        ></Button>
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
import PbErrorToast from './PbErrorToast.vue';
import usePbErrorToast from '../composables/usePbErrorToast';
import type { TSign } from '../../types';

type Props = {
    // undefined = create mode
    signId?: string
}
type Events = {
    saved: []
};
const props = defineProps<Props>();
const emit = defineEmits<Events>();

const visible = defineModel<boolean>({ required: true });

const { addSign, updateSign, loadSign, getNumericLevel } = useSigns();
const saving = ref(false)
const { showPbError } = usePbErrorToast();

// Store selected category for each parent
const selectedCategories = ref<{ [parentId: string]: string[] }>({});

const emptyForm = (): TSign.TForm => ({
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
    Roles: [],
    placement: {
        right: [] as string[],
        left: [] as string[]
    },
    movements: {
        right: {},
        left: {}
    }
});

const form = ref<TSign.TForm>(emptyForm());

const save = async () => {
    saving.value = true;
    // Collect all selected category ids (flatten arrays from each parent)
    const selectedCategoryIds: string[] = [];
    Object.values(selectedCategories.value).forEach(categoryList => {
        if (Array.isArray(categoryList)) {
            selectedCategoryIds.push(...categoryList);
        }
    });
    // Add to form payload
    const payload = {
        ...form.value,
        Category: selectedCategoryIds,
    };
    try {
        if (props.signId) {
            await updateSign(props.signId, payload);
        } else {
            await addSign(payload);
        }
        emit('saved');
        visible.value = false;
    } catch (err) {
        // show formatted PocketBase error(s)
        showPbError(err);
    } finally {
        saving.value = false;
    }
};

watch(visible, async (isVisible) => {
    if (!isVisible) {
        return;
    }
    if (!props.signId) {
        // Reset form when modal is opened in create mode
        form.value = emptyForm();
        selectedCategories.value = {};
        return;
    }
    const sign = await loadSign(props.signId);

    form.value = {
        Category: sign.Category || [],
        name: sign.name,
        definition: sign.definition,
        level: getNumericLevel(sign.level),
        verification_status: sign.verification_status,
        ConfigurationRight: sign.expand?.ConfigurationRight || {},
        ConfigurationLeft: sign.expand?.ConfigurationLeft || {},
        learning_source: sign.learning_source,
        learning_source_detail: sign.learning_source_detail,
        primary_language: sign.primary_language || 'LSF',
        Roles: sign.Roles || [],
        placement: sign.placement || { right: [], left: [] },
        movements: sign.movements || { right: {}, left: {} },
    };
    // Initialize selected categories
    selectedCategories.value = {};
    (sign.expand?.Category || []).forEach(cat => {
        const parentId = cat.Parent!;
        if (!selectedCategories.value[parentId]) {
            selectedCategories.value[parentId] = [];
        }
        selectedCategories.value[parentId].push(cat.id);
    });
}, { immediate: true });
</script>
