<template>
  <Dialog v-model:visible="visible" modal header="Modifier une personne" class="w-[60%]">
    <PersonForm
      ref="personForm"
      v-model="form"
      v-model:categories="selectedCategories"
      v-model:activities="selectedActivities"
      :initial-videos="initialVideos"
    />
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
import type { TPerson, TVideo } from '../../types';

type Props = {
    signId: string
}
type Events = {
    saved: []
};
const props = defineProps<Props>();
const emit = defineEmits<Events>();

const visible = defineModel<boolean>({ required: true });
const personForm = ref<InstanceType<typeof PersonForm>>();

const { updatePerson, loadPerson } = usePersons();
const saving = ref(false)

// Store selected category for each parent
const selectedCategories = ref<{ [parentId: string]: string[] }>({});
const selectedActivities = ref<{ [parentId: string]: string[] }>({});
const initialVideos = ref<TVideo.TRecord[]>([]);

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

    // Sync lists order before saving
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
    await updatePerson(props.signId, payload);
    emit('saved');
    visible.value = false;
    saving.value = false;
};

watch(visible, async (isVisible) => {
    if (!isVisible) {
        return;
    }
    const person = await loadPerson(props.signId);

    form.value = {
        name: person.name,
        firstname: person.firstname || '',
        illustration: null,
        description: person.description || '',
        Sign: person.Sign || undefined,
        Category: person.Category || [],
        Activities: person.Activities || [],
        Videos: person.Videos || [],
        timeline: person.timeline || [],
        deaf: !!person.deaf,
        birthdate: person.birthdate || undefined,
        birthplace: person.birthplace || '',
        deafFamily: !!person.deafFamily,
        family: person.family || '',
        organism: !!person.organism,
    };

    if (person.expand?.Videos) {
        initialVideos.value = person.expand.Videos;
    } else {
        initialVideos.value = [];
    }

    // Initialize selected categories
    selectedCategories.value = {};
    if (person.expand?.Category) {
        person.expand.Category.forEach((cat: any) => {
            const parentId = cat.Parent!;
            if (!selectedCategories.value[parentId]) {
                selectedCategories.value[parentId] = [];
            }
            selectedCategories.value[parentId].push(cat.id);
        });
    }
    // Initialize selected activities
    selectedActivities.value = {};
    if (person.expand?.Activities) {
        person.expand.Activities.forEach((act: any) => {
            const parentId = act.Parent!;
            if (!selectedActivities.value[parentId]) {
                selectedActivities.value[parentId] = [];
            }
            selectedActivities.value[parentId].push(act.id);
        });
    }
}, { immediate: true });
</script>
