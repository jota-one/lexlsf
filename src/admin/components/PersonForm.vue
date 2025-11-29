<template>
    <Tabs v-model:value="activeTab" class="w-full">
        <TabList>
            <Tab :value="0">Informations</Tab>
            <Tab :value="1">Catégories</Tab>
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
</script>
