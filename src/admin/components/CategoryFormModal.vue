<template>
    <Dialog v-model:visible="visible" modal :header="isEditMode ? 'Modifier la catégorie' : 'Ajouter une catégorie'"
        class="w-[32rem]">
        <form @submit.prevent="save" class="space-y-4">
            <div class="flex items-center gap-4">
                <label for="tag" class="font-semibold w-32">Nom</label>
                <InputText ref="tagInput" v-model="form.tag" id="tag" class="w-full" required />
            </div>
            <div class="flex items-center gap-4">
                <label for="slug" class="font-semibold w-32">Slug</label>
                <InputText v-model="form.slug" id="slug" class="w-full" required />
            </div>
            <div v-if="!isEditMode" class="flex items-center gap-4">
                <label for="parent" class="font-semibold w-32">Parent</label>
                <Select v-model="form.Parent" :options="parentOptions" id="parent" class="w-full"
                    placeholder="Aucun (racine)" optionLabel="tag" optionValue="id" :showClear="true" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="font-semibold">Apparaît pour</label>
                <div class="flex flex-wrap gap-2">
                    <template v-for="entity in allEntities" :key="entity.id">
                        <input type="checkbox" v-model="form.entities" :id="`entity-${entity.id}`" :value="entity.id"
                            :disabled="entity.disabled" class="sr-only" />
                        <label :for="`entity-${entity.id}`" class="badge badge-sm cursor-pointer" :class="[
                            (form.entities || []).includes(entity.id) || entity.id === 'sign' ? 'badge-primary' : '',
                            entity.disabled ? 'opacity-60 cursor-not-allowed' : ''
                        ]">
                            {{ entity.label }}
                        </label>
                    </template>
                </div>
            </div>
            <div class="flex justify-end gap-2 pt-4">
                <Button type="button" label="Annuler" severity="secondary" @click="visible = false"></Button>
                <Button type="submit" label="Enregistrer"></Button>
            </div>
        </form>
    </Dialog>
</template>
<script setup lang="ts">
// filepath: /Users/joelpoulin/Sites/astro/lexlsf/src/admin/components/CategoryFormModal.vue
import { ref, computed, onMounted, watch, useTemplateRef } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import useCategories from '../composables/useCategories';

type Events = {
    saved: []
};
const emit = defineEmits<Events>();
const visible = defineModel<boolean>({ required: true });
const props = defineProps<{ parentId?: string | null; categoryToEdit?: any }>();

const form = ref({
    id: '',
    tag: '',
    slug: '',
    Parent: null as string | null,
    entities: [] as string[],
});

const isEditMode = computed(() => !!props.categoryToEdit);

const entityOptions = [
    { id: 'person', label: 'Personnes', disabled: false }
];

const allEntities = [
    { id: 'sign', label: 'Signes', disabled: true },
    ...entityOptions
];

const tagElement = useTemplateRef<{ $el: HTMLInputElement }>('tagInput');

const { categories, loadCategories, saveCategory } = useCategories();

const parentOptions = computed(() =>
    categories.value.map((cat: any) => ({
        id: cat.id,
        tag: cat.tag
    }))
);

onMounted(loadCategories);

watch(
    () => props.parentId,
    (newParentId) => {
        if (!isEditMode.value) {
            form.value.Parent = newParentId ?? null;
        }
    },
    { immediate: true }
);

watch(visible, (v) => {
    if (v) {
        if (isEditMode.value && props.categoryToEdit) {
            // Edit mode: populate form with existing data
            form.value.id = props.categoryToEdit.id;
            form.value.tag = props.categoryToEdit.tag;
            form.value.slug = props.categoryToEdit.slug;
            form.value.Parent = props.categoryToEdit.Parent ?? null;
            form.value.entities = props.categoryToEdit.entities ?? [];
        } else {
            // Create mode: reset form
            form.value.id = '';
            form.value.tag = '';
            form.value.slug = '';
            form.value.Parent = props.parentId ?? null;
            form.value.entities = [];
        }
        // focus first field after dialog is visible
        // need the setTimeout to wait for the animation to finish
        setTimeout(() => {
            tagElement.value?.$el?.focus();
        }, 500);
    }
});

const save = async () => {
    await saveCategory(form.value);
    emit('saved');
    visible.value = false;
};
</script>
