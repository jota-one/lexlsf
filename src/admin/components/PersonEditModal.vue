<template>
    <Dialog v-model:visible="visible" modal header="Modifier une personne" class="w-[60%]">
        <PersonForm ref="personForm" v-model="form" v-model:categories="selectedCategories"
            :initial-videos="initialVideos" />
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
const selectedCategories = ref<{ [parentId: string]: string | null }>({});
const initialVideos = ref<TVideo.TRecord[]>([]);

const form = ref<TPerson.TForm>({
    name: '',
    illustration: null,
    description: '',
    Sign: undefined,
    Category: [],
    Videos: [],
});

const save = async () => {
    saving.value = true;

    // Sync lists order before saving
    personForm.value?.syncListsBeforeSave();

    // Collect selected category ids (one per parent)
    const selectedCategoryIds = Object.values(selectedCategories.value).filter(Boolean) as string[];
    // Add to form payload
    const payload = {
        ...form.value,
        Category: selectedCategoryIds,
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
        illustration: null,
        description: person.description || '',
        Sign: person.Sign || undefined,
        Category: person.Category || [],
        Videos: person.Videos || [],
        highlights: person.highlights || [],
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
            selectedCategories.value[cat.Parent!] = cat.id;
        });
    }
}, { immediate: true });
</script>
