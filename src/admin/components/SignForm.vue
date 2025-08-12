<template>
    <Tabs v-model:value="activeTab" class="w-full">
        <TabList>
            <Tab :value="0">Informations</Tab>
            <Tab :value="1">Catégories</Tab>
            <Tab :value="2">Configurations</Tab>
        </TabList>
        <TabPanels>
            <TabPanel :value="0" class="space-y-4">
                <div class="flex items-center gap-4">
                    <label for="video" class="font-semibold w-40">Vidéo</label>
                    <input type="file" id="video" class="file-input file-input-bordered w-full"
                        @change="onFileChange" />
                </div>
                <!-- Gloss -->
                <div class="flex items-center gap-4">
                    <label for="name" class="font-semibold w-40">Terme</label>
                    <InputText v-model="form.name" id="name" class="w-full" required />
                </div>
                <!-- Statut de vérification -->
                <div class="flex items-center gap-4">
                    <label for="verification_status" class="font-semibold w-40">Statut</label>
                    <Select v-model="form.verification_status" :options="verificationStatusOptions"
                        id="verification_status" class="w-full" placeholder="Sélectionner" optionLabel="label"
                        optionValue="value" required />
                </div>
                <!-- Niveau -->
                <div class="flex items-center gap-4">
                    <label for="level" class="font-semibold w-40">Niveau</label>
                    <Rating v-model="form.level" /> ({{ levelLabel }})
                </div>
                <!-- Source d'apprentissage -->
                <div class="flex items-center gap-4">
                    <label for="learning_source" class="font-semibold w-40">Source d'apprentissage</label>
                    <Select v-model="form.learning_source" :options="learningSourceOptions" id="learning_source"
                        class="w-full" placeholder="Sélectionner" optionLabel="label" optionValue="value" required />
                </div>
                <div class="flex items-center gap-4">
                    <label for="learning_source_detail" class="font-semibold w-40">Personne en
                        particulier</label>
                    <InputText v-model="form.learning_source_detail" id="learning_source_detail" class="w-full"
                        required />
                </div>
                <!-- Langue principale -->
                <div class="flex items-center gap-4">
                    <label for="primary_language" class="font-semibold w-40">Langue principale</label>
                    <Select v-model="form.primary_language" :options="primaryLanguageOptions" id="primary_language"
                        class="w-full" placeholder="Sélectionner" optionLabel="label" optionValue="value" required />
                </div>
            </TabPanel>
            <TabPanel :value="1" class="space-y-4">
                <div class="flex flex-col gap-4 w-full">
                    <template v-for="parent in parentCategories" :key="parent.id">
                        <div>
                            <span class="font-semibold">{{ parent.tag }}</span>
                            <Select v-model="selectedCategories[parent.id]"
                                :options="[{ tag: 'Sélectionner une catégorie', id: null }, ...childCategoryOptions(parent)]"
                                :placeholder="'Sélectionner une catégorie...'" optionLabel="tag" optionValue="id"
                                class="w-full mt-1" :showClear="true"
                                :disabled="childCategoryOptions(parent).length === 0" />
                        </div>
                    </template>
                </div>
            </TabPanel>
            <TabPanel :value="2" class="space-y-4">
                <!-- Right hand configuration -->
                <div class="flex items-center gap-4">
                    <label for="dominant_hand_config" class="font-semibold w-40">Config main droite</label>
                    <Select v-model="form.ConfigurationRight" :options="handConfigOptions" id="dominant_hand_config"
                        class="w-full" placeholder="Sélectionner" optionLabel="label" optionValue="value"
                        :loading="loadingHandConfigurations" required />
                </div>
                <!-- Left hand configuration -->
                <div class="flex items-center gap-4">
                    <label for="non_dominant_hand_config" class="font-semibold w-40">Config main gauche</label>
                    <Select v-model="form.ConfigurationLeft" :options="handConfigOptions" id="non_dominant_hand_config"
                        class="w-full" placeholder="Sélectionner" optionLabel="label" optionValue="value"
                        :loading="loadingHandConfigurations" />
                </div>
                <!-- Right hand location -->
                <div class="flex items-center gap-4">
                    <label for="dominant_hand_location" class="font-semibold w-40">Placement main droite</label>
                    <Select v-model="form.location_right" :options="handLocationOptions" id="dominant_hand_location"
                        class="w-full" placeholder="Sélectionner" optionLabel="label" optionValue="value" required />
                </div>
                <!-- Non-dominant hand location -->
                <div class="flex items-center gap-4">
                    <label for="non_dominant_hand_location" class="font-semibold w-40">Placement main
                        gauche</label>
                    <Select v-model="form.location_left" :options="handLocationOptions" id="non_dominant_hand_location"
                        class="w-full" placeholder="Sélectionner" optionLabel="label" optionValue="value" />
                </div>
                <!-- Dominant hand movement -->
                <div class="flex items-center gap-4">
                    <label for="dominant_hand_movement" class="font-semibold w-40">Mouvement main droite</label>
                    <Select v-model="form.dominant_hand_movement" :options="dominantHandMovementOptions"
                        id="dominant_hand_movement" class="w-full" placeholder="Sélectionner" optionLabel="label"
                        optionValue="value" :loading="loadingHandMovements" required />
                </div>
                <!-- Non-dominant hand movement -->
                <div class="flex items-center gap-4">
                    <label for="non_dominant_hand_movement" class="font-semibold w-40">Mouvement main
                        gauche</label>
                    <Select v-model="form.non_dominant_hand_movement" :options="nonDominantHandMovementOptions"
                        id="non_dominant_hand_movement" class="w-full" placeholder="Sélectionner" optionLabel="label"
                        optionValue="value" :loading="loadingHandMovements" />
                </div>
                <!-- Coordination des mains -->
                <div class="flex items-center gap-4">
                    <label for="hand_coordination" class="font-semibold w-40">Coordination des mains</label>
                    <Select v-model="form.hand_coordination" :options="handCoordinationOptions" id="hand_coordination"
                        class="w-full" placeholder="Sélectionner" optionLabel="label" optionValue="value" required />
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
import Rating from 'primevue/rating';
import useHandConfigurations from '../composables/useHandConfigurations';
import useHandLocations from '../composables/useHandLocations';
import useHandMovements from '../composables/useHandMovements';
import useSigns from '../composables/useSigns';
import useCategories from '../composables/useCategories';

const form = defineModel<any>({ required: true });
const selectedCategories = defineModel<{ [parentId: string]: string | null }>('categories', { required: true });
const activeTab = ref(0);

// Static options
const handCoordinationOptions = [
    { label: 'Main droite', value: 'one_handed_dominant' },
    { label: 'Main gauche', value: 'one_handed_non_dominant' },
    { label: 'Deux mains synchrones', value: 'two_handed_synchronous' },
    { label: 'Deux mains alternées', value: 'two_handed_alternating' },
    { label: 'Deux mains séquentielles', value: 'two_handed_sequential' }
];

// --- Use composables for relations ---
const {
    handConfigurations,
    loadingHandConfigurations,
    loadHandConfigurations
} = useHandConfigurations();

const {
    handLocationOptions,
} = useHandLocations();
const {
    handMovements,
    loadingHandMovements,
    loadHandMovements
} = useHandMovements();

const { learningSourceOptions, primaryLanguageOptions, verificationStatusOptions } = useSigns();

const { categories, loadCategories } = useCategories();

// Filtered options for dominant/non-dominant
const handConfigOptions = computed(() =>
    handConfigurations.value
        .map((c: any) => ({
            label: c.name,
            value: c.id
        }))
);

const dominantHandMovementOptions = computed(() =>
    handMovements.value
        .filter((m: any) => m.hand_type === 'dominant')
        .map((m: any) => ({
            label: `${m.hand_type} - ${m.direction || '—'}`,
            value: m.id
        }))
);
const nonDominantHandMovementOptions = computed(() =>
    handMovements.value
        .filter((m: any) => m.hand_type === 'non_dominant')
        .map((m: any) => ({
            label: `${m.hand_type} - ${m.direction || '—'}`,
            value: m.id
        }))
);

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
    loadCategories();
    loadHandConfigurations();
    loadHandMovements();
});

const levelLabel = computed(() => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    return levels[form.value.level - 1] || '';
});

const onFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    form.value.video = target.files && target.files.length > 0 ? target.files[0] : null;
};
</script>
