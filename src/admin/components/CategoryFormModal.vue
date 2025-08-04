<template>
    <Dialog v-model:visible="visible" modal header="Ajouter une catégorie" class="w-[32rem]">
        <form @submit.prevent="save" class="space-y-4">
            <div class="flex items-center gap-4">
                <label for="tag" class="font-semibold w-32">Nom</label>
                <InputText v-model="form.tag" id="tag" class="w-full" required />
            </div>
            <div class="flex items-center gap-4">
                <label for="slug" class="font-semibold w-32">Slug</label>
                <InputText v-model="form.slug" id="slug" class="w-full" required />
            </div>
            <div class="flex items-center gap-4">
                <label for="parent" class="font-semibold w-32">Parent</label>
                <Dropdown v-model="form.Parent" :options="parentOptions" id="parent" class="w-full"
                    placeholder="Aucun (racine)" optionLabel="tag" optionValue="id" :showClear="true" />
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
import { ref, computed, onMounted } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import useCategories from '../composables/useCategories';

type Events = {
    saved: []
};
const emit = defineEmits<Events>();
const visible = defineModel<boolean>({ required: true });

const form = ref({
    tag: '',
    slug: '',
    Parent: null as string | null,
});

const { categories, loadCategories, saveCategory } = useCategories();

const parentOptions = computed(() =>
    categories.value.map((cat: any) => ({
        id: cat.id,
        tag: cat.tag
    }))
);

onMounted(loadCategories);

const save = async () => {
    await saveCategory(form.value);
    emit('saved');
    visible.value = false;
    form.value = {
        tag: '',
        slug: '',
        Parent: null
    }; // Reset the form
};
</script>
