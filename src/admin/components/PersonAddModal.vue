<template>
  <Dialog v-model:visible="visible" modal header="Ajouter une personne" class="w-[60%]">
    <PersonForm
      ref="personForm"
      v-model="form"
      v-model:categories="selectedCategories"
      v-model:activities="selectedActivities"
    />
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
import PersonForm from './PersonForm.vue';
import usePersons from '../composables/usePersons';
import PbErrorToast from './PbErrorToast.vue';
import usePbErrorToast from '../composables/usePbErrorToast';
import type { TPerson } from '../../types';

type Events = {
    saved: []
};
const emit = defineEmits<Events>();

const visible = defineModel<boolean>({ required: true });
const personForm = ref<InstanceType<typeof PersonForm>>();

const { addPerson } = usePersons();
const saving = ref(false)
const { showPbError } = usePbErrorToast();

// Store selected category/activity for each parent
const selectedCategories = ref<{ [parentId: string]: string[] }>({});
const selectedActivities = ref<{ [parentId: string]: string[] }>({});

const form = ref<TPerson.TForm>({
    name: '',
    firstname: '',
    illustration: null,
    description: '',
    Sign: undefined,
    Category: [],
    Activities: [],
    Videos: [],
    deaf: false,
    birthdate: undefined,
    birthplace: '',
    deafFamily: false,
    family: '',
    organism: false,
});

const save = async () => {
    saving.value = true;

    // Sync various stuffs before saving
    personForm.value?.syncListsBeforeSave();

    // Collect all selected category ids (flatten arrays from each parent)
    const selectedCategoryIds: string[] = [];
    Object.values(selectedCategories.value).forEach(categoryList => {
        if (Array.isArray(categoryList)) {
            selectedCategoryIds.push(...categoryList);
        }
    });
    // Collect all selected activity ids (flatten arrays from each parent)
    const selectedActivityIds: string[] = [];
    Object.values(selectedActivities.value).forEach(activityList => {
        if (Array.isArray(activityList)) {
            selectedActivityIds.push(...activityList);
        }
    });

    // Add to form payload
    const payload = {
        ...form.value,
        Category: selectedCategoryIds,
        Activities: selectedActivityIds,
    };
    try {
        await addPerson(payload);
        emit('saved');
        visible.value = false;
    } catch (err) {
        // show formatted PocketBase error(s)
        showPbError(err);
    } finally {
        saving.value = false;
    }
};

watch(visible, (newVal) => {
    if (newVal) {
        // Reset form when modal is opened
        form.value = {
            name: '',
            illustration: null,
            description: '',
            Sign: undefined,
            Category: [],
            Activities: [],
            Videos: [],
        };
        selectedCategories.value = {};
        selectedActivities.value = {};
    }
}, { immediate: true });
</script>
