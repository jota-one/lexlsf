<template>
    <Tabs v-model:value="activeTab" class="w-full">
        <TabList>
            <Tab :value="0">Informations</Tab>
            <Tab :value="1">Catégories</Tab>
            <Tab :value="2">Configurations</Tab>
            <Tab :value="3">Emplacements</Tab>
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
                        :loading="loadingHandConfigurations" required>
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex items-center">
                                <div class="flex items-center">
                                    <img v-if="slotProps.value.illustration"
                                        :src="getIllustrationUrl(slotProps.value.illustration, slotProps.value.id)"
                                        alt="illustration" class="w-8 h-8 object-contain rounded mr-2" />
                                    <span>{{ slotProps.value.name }}</span>
                                </div>
                            </div>
                            <span v-else>
                                {{ slotProps.placeholder }}
                            </span>
                        </template>
                        <template #option="slotProps">
                            <div class="flex items-center">
                                <img v-if="slotProps.option.illustration"
                                    :src="getIllustrationUrl(slotProps.option.illustration, slotProps.option.value.id)"
                                    alt="illustration" class="w-8 h-8 object-contain rounded mr-2" />
                                <span>{{ slotProps.option.label }}</span>
                            </div>
                        </template>
                    </Select>
                </div>
                <!-- Left hand configuration -->
                <div class="flex items-center gap-4">
                    <label for="non_dominant_hand_config" class="font-semibold w-40">Config main gauche</label>
                    <Select v-model="form.ConfigurationLeft" :options="handConfigOptions" id="non_dominant_hand_config"
                        class="w-full" placeholder="Sélectionner" optionLabel="label" optionValue="value"
                        :loading="loadingHandConfigurations">
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex items-center">
                                <div class="flex items-center">
                                    <img v-if="slotProps.value.illustration"
                                        :src="getIllustrationUrl(slotProps.value.illustration, slotProps.value.id)"
                                        alt="illustration" class="w-8 h-8 object-contain rounded mr-2" />
                                    <span>{{ slotProps.value.name }}</span>
                                </div>
                            </div>
                            <span v-else>
                                {{ slotProps.placeholder }}
                            </span>
                        </template>
                        <template #option="slotProps">
                            <div class="flex items-center">
                                <img v-if="slotProps.option.illustration"
                                    :src="getIllustrationUrl(slotProps.option.illustration, slotProps.option.value.id)"
                                    alt="illustration" class="w-8 h-8 object-contain rounded mr-2" />
                                <span>{{ slotProps.option.label }}</span>
                            </div>
                        </template>
                    </Select>
                </div>
            </TabPanel>
            <TabPanel :value="3" class="space-y-4">
                <div class="flex flex-col items-center gap-4">
                    <div>
                        <label class="font-semibold">Quelle main?</label>
                        <div class="flex gap-4 mt-2">
                            <input type="radio" id="rightHand" value="rightHand" v-model="activeHand" />
                            <label for="rightHand">Main droite</label>
                            <input type="radio" id="leftHand" value="leftHand" v-model="activeHand" />
                            <label for="leftHand">Main gauche</label>
                        </div>
                    </div>
                    <div class="flex">
                        <FaceZonesOverlay v-model="form.placement[activeHand]" interactive
                            :color="colorConfig[activeHand]" />
                        <BodyZonesOverlay v-model="form.placement[activeHand]" interactive
                            :color="colorConfig[activeHand]" />
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
import Rating from 'primevue/rating';
import useHandConfigurations from '../composables/useHandConfigurations';
import useSigns from '../composables/useSigns';
import useCategories from '../composables/useCategories';
import FaceZonesOverlay from './FaceZonesOverlay.vue';
import BodyZonesOverlay from './BodyZonesOverlay.vue';

const form = defineModel<any>({ required: true });
const selectedCategories = defineModel<{ [parentId: string]: string | null }>('categories', { required: true });
const activeTab = ref(0);
const activeHand = ref<'rightHand' | 'leftHand'>('rightHand');

const colorConfig = {
    rightHand: '#ff000088',
    leftHand: '#00b3ff88'
};

// --- Use composables for relations ---
const {
    handConfigurations,
    loadingHandConfigurations,
    loadHandConfigurations,
    getIllustrationUrl,
} = useHandConfigurations();

const { learningSourceOptions, primaryLanguageOptions, verificationStatusOptions } = useSigns();

const { categories, loadCategories } = useCategories();

// Filtered options for dominant/non-dominant
const handConfigOptions = computed(() =>
    handConfigurations.value
        .map((c: any) => ({
            label: c.name,
            value: c,
            illustration: c.illustration
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
    loadHandConfigurations('name');
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
