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
                <div class="flex items-center gap-4">
                    <label for="name" class="font-semibold w-40">Définition</label>
                    <Textarea v-model="form.definition" class="w-full" rows="5" cols="30" />
                </div>
                <!-- Statut de vérification -->
                <div class="flex items-center gap-4">
                    <label for="verification_status" class="font-semibold w-40">Statut</label>
                    <template v-for="(child, index) in verificationStatusOptions" :key="index">
                        <input type="radio" v-model="form.verification_status" :id="`status-${index}`"
                            :value="child.value" class="sr-only" />
                        <label :for="`status-${index}`" class="badge badge-sm cursor-pointer"
                            :class="form.verification_status === child.value ? 'badge-primary' : ''">
                            {{ child.label }}
                        </label>
                    </template>
                </div>
                <!-- Niveau -->
                <div class="flex items-center gap-4">
                    <label for="level" class="font-semibold w-40">Niveau</label>
                    <Rating v-model="form.level" /> ({{ levelLabel }})
                </div>
                <!-- Source d'apprentissage -->
                <div class="flex items-center gap-4">
                    <label for="learning_source" class="font-semibold w-40">Source d'apprentissage</label>
                    <template v-for="(child, index) in learningSourceOptions" :key="index">
                        <input type="radio" v-model="form.learning_source" :id="`learn-${index}`" :value="child.value"
                            class="sr-only" />
                        <label :for="`learn-${index}`" class="badge badge-sm cursor-pointer"
                            :class="form.learning_source === child.value ? 'badge-primary' : ''">
                            {{ child.label }}
                        </label>
                    </template>
                </div>
                <div class="flex items-center gap-4">
                    <label for="learning_source_detail" class="font-semibold w-40">Précision</label>
                    <InputText v-model="form.learning_source_detail" id="learning_source_detail" class="w-full"
                        required />
                </div>
                <!-- Langue principale -->
                <div class="flex items-center gap-4">
                    <label for="primary_language" class="font-semibold w-40">Langue principale</label>
                    <template v-for="(child, index) in primaryLanguageOptions" :key="index">
                        <input type="radio" v-model="form.primary_language" :id="`lang-${index}`" :value="child.value"
                            class="sr-only" />
                        <label :for="`lang-${index}`" class="badge badge-sm cursor-pointer whitespace-nowrap"
                            :class="form.primary_language === child.value ? 'badge-primary' : ''">
                            {{ child.label }}
                        </label>
                    </template>
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
                                        :id="`cat-${parent.id}-${child.id}`" :name="`cat-group-${parent.id}`"
                                        :value="child.id" class="sr-only" />
                                    <label :for="`cat-${parent.id}-${child.id}`"
                                        class="badge badge-sm mr-1 cursor-pointer"
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
                            <input type="radio" id="rightHand" value="right" v-model="activeHand" />
                            <label for="rightHand">Main droite</label>
                            <input type="radio" id="leftHand" value="left" v-model="activeHand" />
                            <label for="leftHand">Main gauche</label>
                        </div>
                    </div>
                    <div class="flex">
                        <FaceZonesOverlay :active-hand="activeHand" v-model:right="form.placement.right"
                            v-model:left="form.placement.left" interactive :color-config="colorConfig" />
                        <BodyZonesOverlay :active-hand="activeHand" v-model:right="form.placement.right"
                            v-model:left="form.placement.left" interactive :color-config="colorConfig" />
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
import Textarea from 'primevue/textarea';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Rating from 'primevue/rating';
import RadioButtonGroup from 'primevue/radiobuttongroup';
import RadioButton from 'primevue/radiobutton';
import useHandConfigurations from '../composables/useHandConfigurations';
import useSigns from '../composables/useSigns';
import useCategories from '../composables/useCategories';
import FaceZonesOverlay from './FaceZonesOverlay.vue';
import BodyZonesOverlay from './BodyZonesOverlay.vue';
import type { Ui } from '../../types';

const form = defineModel<any>({ required: true });
const selectedCategories = defineModel<{ [parentId: string]: string | null }>('categories', { required: true });
const activeTab = ref(0);
const activeHand = ref<'right' | 'left'>('right');

const colorConfig: Ui.ColorConfig = {
    right: '#ff000088',
    left: '#00b3ff88'
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

    if (form.value.video) {
        // use file name (without extension) as value for form.name if it's empty
        if (!form.value.name) {
            const fileName = form.value.video.name;
            form.value.name = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        }
    }
};
</script>
