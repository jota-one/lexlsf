<template>
    <Tabs v-model:value="activeTab" class="w-full">
        <TabList>
            <Tab :value="0">Informations</Tab>
            <Tab :value="1">Catégories</Tab>
            <Tab :value="2">Bio</Tab>
        </TabList>
        <TabPanels>
            <TabPanel :value="0" class="space-y-4">
                <!-- Illustration -->
                <div class="flex items-center gap-4">
                    <label for="illustration" class="font-semibold w-40">Illustration</label>
                    <input type="file" id="illustration" class="file-input file-input-bordered w-full"
                        @change="onFileChange" />
                </div>

                <!-- Nom -->
                <div class="flex items-center gap-4">
                    <label for="name" class="font-semibold w-40">Nom</label>
                    <InputText v-model="form.name" id="name" class="w-full" required />
                </div>

                <!-- Description -->
                <div class="flex items-start gap-4">
                    <label for="description" class="font-semibold w-40 pt-2">Description</label>
                    <textarea v-model="form.description" id="description" class="textarea textarea-bordered w-full"
                        rows="4" placeholder="Description de la personne"></textarea>
                </div>

                <!-- Signe associé -->
                <div class="flex items-center gap-4">
                    <label for="sign" class="font-semibold w-40">Signe associé</label>
                    <Select v-model="form.Sign" :options="signOptions" id="sign" class="w-full" optionLabel="label"
                        optionValue="value" placeholder="Sélectionner un signe" show-clear />
                </div>
            </TabPanel>

            <TabPanel :value="1" class="space-y-4">
                <div class="flex flex-col gap-4 w-full">
                    <template v-for="parent in parentCategories" :key="parent.id">
                        <div>
                            <span class="font-semibold mb-2 block">{{ parent.tag }}</span>
                            <div class="flex flex-wrap gap-2">
                                <template v-for="child in childCategoryOptions(parent)" :key="child.id">
                                    <input type="radio" v-model="selectedCategories[parent.id]"
                                        :id="`person-cat-${parent.id}-${child.id}`" :value="child.id" class="sr-only" />
                                    <label :for="`person-cat-${parent.id}-${child.id}`"
                                        class="badge badge-sm cursor-pointer"
                                        :class="selectedCategories[parent.id] === child.id ? 'badge-primary' : ''">
                                        {{ child.tag }}
                                    </label>
                                </template>
                            </div>
                        </div>
                    </template>
                </div>
            </TabPanel>

            <TabPanel :value="2" class="space-y-4">
                <div class="flex flex-col gap-4 w-full">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold text-lg">Entrées biographiques</h3>
                    </div>
                    <div v-if="form.highlights && form.highlights.length === 0"
                        class="text-center text-base-content/50 py-8">
                        Aucune entrée biographique. Cliquez sur "Ajouter une entrée" pour commencer.
                    </div>

                    <div v-for="(entry, index) in form.highlights" :key="index" class="card card-border">

                        <!-- Mode édition -->
                        <div v-if="editingBioIndex === index" class="space-y-3">
                            <div class="flex justify-between items-start gap-4">
                                <div class="flex-1 space-y-3">
                                    <!-- Titre -->
                                    <div>
                                        <label :for="`bio-title-${index}`" class="label text-sm font-semibold">
                                            Titre
                                        </label>
                                        <InputText v-model="entry.title" :id="`bio-title-${index}`" class="w-full"
                                            placeholder="Ex: 1990-2000, Jeunesse, Formation..." />
                                    </div>

                                    <!-- Description -->
                                    <div>
                                        <label :for="`bio-desc-${index}`" class="label text-sm font-semibold">
                                            Description
                                        </label>
                                        <textarea v-model="entry.description" :id="`bio-desc-${index}`"
                                            class="textarea textarea-bordered w-full" rows="3"
                                            placeholder="Description de cette période ou événement..."></textarea>
                                    </div>
                                </div>

                                <div class="flex flex-col gap-2">
                                    <!-- Bouton valider -->
                                    <button type="button" @click="validateBioEntry()"
                                        class="btn btn-square btn-sm btn-success btn-outline"
                                        title="Valider cette entrée">
                                        <span class="i-fa-solid-check"></span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Mode lecture compacte -->
                        <div v-else class="flex justify-between items-start gap-4">
                            <div class="flex-1">
                                <h4 class="font-semibold text-base mb-1">{{ entry.title || '(Sans titre)' }}</h4>
                                <p class="text-sm text-base-content/70">{{ entry.description || '(Sans description)' }}
                                </p>
                            </div>

                            <div class="flex gap-2">
                                <!-- Bouton éditer -->
                                <button type="button" @click="editBioEntry(index)"
                                    class="btn btn-square btn-sm btn-outline" title="Éditer cette entrée">
                                    <span class="i-fa-solid-pen"></span>
                                </button>

                                <!-- Bouton supprimer -->
                                <button type="button" @click="removeBioEntry(index)"
                                    class="btn btn-square btn-sm btn-error btn-outline" title="Supprimer cette entrée">
                                    <span class="i-fa-solid-times"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end items-center mb-4">
                        <button type="button" @click="addBioEntry" class="btn btn-primary btn-sm">
                            <span class="i-fa-solid-plus"></span>
                            Ajouter une entrée
                        </button>
                    </div>
                </div>
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import useCategories from '../composables/useCategories';
import useSigns from '../composables/useSigns';
import type { TPerson } from '../../types';

const form = defineModel<TPerson.TForm>({ required: true });
const selectedCategories = defineModel<{ [parentId: string]: string | null }>('categories', { required: true });
const activeTab = ref(0);
const editingBioIndex = ref<number | null>(null);

const { signs, loadSigns } = useSigns();
const signOptions = computed(() =>
    signs.value.map((s: any) => ({ label: s.name, value: s.id }))
);

const { categories, loadCategories } = useCategories();

// Parent categories (those with Parent == null)
const parentCategories = computed(() =>
    categories.value.filter((cat: any) => !cat.Parent)
);

// For each parent, get its children (category_via_Parent)
const childCategoryOptions = (parent: any) => {
    return (parent.expand?.category_via_Parent || []);
};

// When categories are loaded, initialize selectedCategories
watch(categories, () => {
    parentCategories.value.forEach(parent => {
        if (!(parent.id in selectedCategories.value)) {
            selectedCategories.value[parent.id] = null;
        }
    });
});

onMounted(() => {
    loadCategories('person');
    loadSigns();
});

const onFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    form.value.illustration = target.files && target.files.length > 0 ? target.files[0] : null;

    if (form.value.illustration) {
        // use file name (without extension) as value for form.name if it's empty
        if (!form.value.name) {
            const fileName = form.value.illustration.name;
            form.value.name = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        }
    }
};

// Initialize highlights if not present
if (!form.value.highlights) {
    form.value.highlights = [];
}

const addBioEntry = () => {
    if (!form.value.highlights) {
        form.value.highlights = [];
    }
    const newIndex = form.value.highlights.length;
    form.value.highlights.push({ title: '', description: '' });
    editingBioIndex.value = newIndex; // Mettre la nouvelle entrée en mode édition
};

const removeBioEntry = (index: number) => {
    if (form.value.highlights) {
        form.value.highlights.splice(index, 1);
        // Si on supprime l'entrée en cours d'édition, on désactive le mode édition
        if (editingBioIndex.value === index) {
            editingBioIndex.value = null;
        } else if (editingBioIndex.value !== null && editingBioIndex.value > index) {
            // Ajuster l'index si on supprime une entrée avant celle en édition
            editingBioIndex.value--;
        }
    }
};

const editBioEntry = (index: number) => {
    editingBioIndex.value = index;
};

const validateBioEntry = () => {
    editingBioIndex.value = null;
};
</script>
