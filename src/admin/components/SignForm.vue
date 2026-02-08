<template>
  <Tabs v-model:value="activeTab" class="w-full">
    <TabList>
      <Tab :value="0">Informations</Tab>
      <Tab :value="1">Catégories</Tab>
      <Tab :value="2">Configurations</Tab>
      <Tab :value="3">Mouvements</Tab>
      <Tab :value="4">Emplacements</Tab>
    </TabList>
    <TabPanels>
      <TabPanel :value="0" class="space-y-4">
        <div class="flex items-center gap-4">
          <label for="video" class="font-semibold w-40">Vidéo</label>
          <input
            type="file"
            id="video"
            class="file-input file-input-bordered w-full"
            @change="onFileChange"
          />
        </div>
        <!-- Gloss -->
        <div class="flex items-center gap-4">
          <label for="name" class="font-semibold w-40">Terme</label>
          <InputText v-model="form.name" id="name" class="w-full" required />
        </div>
        <!-- Slug -->
        <div class="flex items-center gap-4">
          <label for="slug" class="font-semibold w-40">Slug</label>
          <div class="flex gap-2 w-full">
            <InputText
              v-model="form.slug"
              id="slug"
              class="flex-1"
              placeholder="Auto-généré depuis le terme"
            />
            <Button
              icon="i-fa6-solid-arrows-rotate"
              severity="secondary"
              size="small"
              @click="regenerateSlug"
              v-tooltip="'Régénérer depuis le terme'"
            />
          </div>
        </div>
        <div class="flex items-center gap-4">
          <label for="name" class="font-semibold w-40">Définition</label>
          <Textarea v-model="form.definition" class="w-full" rows="5" cols="30" />
        </div>
        <!-- Statut de vérification -->
        <div class="flex items-center gap-4">
          <label for="verification_status" class="font-semibold w-40">Statut</label>
          <template v-for="(child, index) in verificationStatusOptions" :key="index">
            <input
              type="radio"
              v-model="form.verification_status"
              :id="`status-${index}`"
              :value="child.value"
              class="sr-only"
            />
            <label
              :for="`status-${index}`"
              class="badge badge-md cursor-pointer"
              :class="form.verification_status === child.value ? 'badge-primary' : ''"
            >
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
            <input
              type="radio"
              v-model="form.learning_source"
              :id="`learn-${index}`"
              :value="child.value"
              class="sr-only"
            />
            <label
              :for="`learn-${index}`"
              class="badge badge-md cursor-pointer"
              :class="form.learning_source === child.value ? 'badge-primary' : ''"
            >
              {{ child.label }}
            </label>
          </template>
        </div>
        <div class="flex items-center gap-4">
          <label for="learning_source_detail" class="font-semibold w-40">Précision</label>
          <InputText
            v-model="form.learning_source_detail"
            id="learning_source_detail"
            class="w-full"
            required
          />
        </div>
        <!-- Langue principale -->
        <div class="flex items-center gap-4">
          <label for="primary_language" class="font-semibold w-40">Langue principale</label>
          <template v-for="(child, index) in primaryLanguageOptions" :key="index">
            <input
              type="radio"
              v-model="form.primary_language"
              :id="`lang-${index}`"
              :value="child.value"
              class="sr-only"
            />
            <label
              :for="`lang-${index}`"
              class="badge badge-md cursor-pointer whitespace-nowrap"
              :class="form.primary_language === child.value ? 'badge-primary' : ''"
            >
              {{ child.label }}
            </label>
          </template>
        </div>
      </TabPanel>
      <TabPanel :value="1" class="space-y-4">
        <CategoriesPickerForm v-model="selectedCategories" />
      </TabPanel>
      <TabPanel :value="2" class="space-y-4">
        <!-- Right hand configuration -->
        <div class="flex items-center gap-4">
          <label for="dominant_hand_config" class="font-semibold w-40">Config main droite</label>
          <Select
            v-model="form.ConfigurationRight"
            :options="handConfigOptions"
            id="dominant_hand_config"
            class="w-full"
            placeholder="Sélectionner"
            optionLabel="label"
            optionValue="value"
            :loading="loadingHandConfigurations"
            required
            show-clear
          >
            <template #value="slotProps">
              <div v-if="slotProps.value?.id" class="flex items-center">
                <div class="flex items-center">
                  <img
                    v-if="slotProps.value.illustration"
                    :src="getIllustrationUrl(slotProps.value.illustration, slotProps.value.id)"
                    alt="illustration"
                    class="w-8 h-8 object-contain rounded mr-2"
                  />
                  <span>{{ slotProps.value.name }}</span>
                </div>
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #option="slotProps">
              <div class="flex items-center">
                <img
                  v-if="slotProps.option.illustration"
                  :src="getIllustrationUrl(slotProps.option.illustration, slotProps.option.value.id)"
                  alt="illustration"
                  class="w-8 h-8 object-contain rounded mr-2"
                />
                <span>{{ slotProps.option.label }}</span>
              </div>
            </template>
          </Select>
        </div>
        <!-- Left hand configuration -->
        <div class="flex items-center gap-4">
          <label for="non_dominant_hand_config" class="font-semibold w-40"
            >Config main gauche</label
          >
          <Select
            v-model="form.ConfigurationLeft"
            :options="handConfigOptions"
            id="non_dominant_hand_config"
            class="w-full"
            placeholder="Sélectionner"
            optionLabel="label"
            optionValue="value"
            :loading="loadingHandConfigurations"
            show-clear
          >
            <template #value="slotProps">
              <div v-if="slotProps.value?.id" class="flex items-center">
                <div class="flex items-center">
                  <img
                    v-if="slotProps.value.illustration"
                    :src="getIllustrationUrl(slotProps.value.illustration, slotProps.value.id)"
                    alt="illustration"
                    class="w-8 h-8 object-contain rounded mr-2"
                  />
                  <span>{{ slotProps.value.name }}</span>
                </div>
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #option="slotProps">
              <div class="flex items-center">
                <img
                  v-if="slotProps.option.illustration"
                  :src="getIllustrationUrl(slotProps.option.illustration, slotProps.option.value.id)"
                  alt="illustration"
                  class="w-8 h-8 object-contain rounded mr-2"
                />
                <span>{{ slotProps.option.label }}</span>
              </div>
            </template>
          </Select>
        </div>
      </TabPanel>
      <TabPanel :value="3" class="space-y-4">
        <div class="">
          <h3 class="text-xl mb-4 border-b">Main droite</h3>
          <HandMovementForm v-model="form.movements.right" key="mov-right" />
        </div>
        <div class="" v-if="form.ConfigurationLeft?.id">
          <h3 class="text-xl mb-4 border-b">Main gauche</h3>
          <HandMovementForm v-model="form.movements.left" key="mov-left" />
        </div>
      </TabPanel>
      <TabPanel :value="4" class="space-y-4">
        <div class="flex flex-col items-center gap-4">
          <div v-if="form.ConfigurationLeft?.id">
            <label class="font-semibold">Quelle main?</label>
            <div class="flex gap-4 mt-2">
              <input type="radio" id="rightHand" value="right" v-model="activeHand" />
              <label for="rightHand">Main droite</label>
              <input type="radio" id="leftHand" value="left" v-model="activeHand" />
              <label for="leftHand">Main gauche</label>
            </div>
          </div>
          <div class="flex">
            <FaceZonesOverlay
              :active-hand="activeHand"
              v-model:right="form.placement.right"
              v-model:left="form.placement.left"
              interactive
              :color-config="colorConfig"
            />
            <BodyZonesOverlay
              :active-hand="activeHand"
              v-model:right="form.placement.right"
              v-model:left="form.placement.left"
              interactive
              :color-config="colorConfig"
            />
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
import Button from 'primevue/button';
import useHandConfigurations from '../composables/useHandConfigurations';
import useSigns from '../composables/useSigns';
import CategoriesPickerForm from './CategoriesPickerForm.vue';
import FaceZonesOverlay from './FaceZonesOverlay.vue';
import BodyZonesOverlay from './BodyZonesOverlay.vue';
import type { TSign, Ui } from '../../types';
import HandMovementForm from './HandMovementForm.vue';
import { createSlug } from '@admin/helpers/strings';

const form = defineModel<TSign.TForm>({ required: true });
const selectedCategories = defineModel<{ [parentId: string]: string[] }>('categories', { required: true });
const activeTab = ref(0);
const activeHand = ref<'right' | 'left'>('right');

const colorConfig: Ui.ColorConfig = {
    right: '#dc262688',
    left: '#2563eb88'
};

// --- Use composables for relations ---
const {
    handConfigurations,
    loadingHandConfigurations,
    loadHandConfigurations,
    getIllustrationUrl,
} = useHandConfigurations();

const { learningSourceOptions, primaryLanguageOptions, verificationStatusOptions } = useSigns();

// Filtered options for dominant/non-dominant
const handConfigOptions = computed(() =>
    handConfigurations.value
        .map((c: any) => ({
            label: c.name,
            value: c,
            illustration: c.illustration
        }))
);

watch(() => form.value.ConfigurationLeft?.id, (value) => {
    console.log('config left changed!!', value);
    console.log('placements', form.value.placement);


    if (!value && activeHand.value !== 'right') {
        activeHand.value = 'right'
        form.value.placement.left = []
    }
})

onMounted(() => {
  loadHandConfigurations('name');
});

const levelLabel = computed(() => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    return levels[form.value.level - 1] || '';
});

// Slug management
const regenerateSlug = () => {
  if (form.value.name) {
    form.value.slug = createSlug(form.value.name)
  }
}

// Auto-generate slug on name change for new records
watch(() => form.value.name, (newName) => {
  // Only auto-generate if slug is empty or this is a new record
  if ((!form.value.slug || !form.value.id) && newName) {
    form.value.slug = createSlug(newName)
  }
})

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
