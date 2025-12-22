<template>
  <Tabs v-model:value="activeTab" class="w-full">
    <TabList>
      <Tab :value="0">Informations</Tab>
      <Tab :value="1">Description</Tab>
      <Tab :value="2">Catégories</Tab>
      <Tab :value="3">Timeline</Tab>
      <Tab :value="4">Vidéos</Tab>
    </TabList>
    <TabPanels>
      <TabPanel :value="0" class="space-y-4">
        <!-- Illustration -->
        <div class="flex items-center gap-4">
          <label for="illustration" class="font-semibold w-60">Illustration</label>
          <input
            type="file"
            id="illustration"
            class="file-input file-input-bordered w-full"
            @change="onFileChange"
          />
        </div>

        <!-- Personne/organisme -->
        <div class="flex items-center gap-4">
          <label for="deaf" class="font-semibold w-60">Personne/organisme</label>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="text-sm transition-colors"
              :class="form.organism ? 'text-base-content/50' : 'text-base-content font-semibold'"
              @click="form.organism = false"
              aria-label="Choisir Personne"
            >
              Personne
            </button>
            <ToggleSwitch v-model="form.organism" inputId="deaf" />
            <button
              type="button"
              class="text-sm transition-colors"
              :class="form.organism ? 'text-base-content font-semibold' : 'text-base-content/50'"
              @click="form.organism = true"
              aria-label="Choisir Organisme"
            >
              Organisme
            </button>
          </div>
        </div>

        <!-- Nom -->
        <div class="flex items-center gap-4">
          <label for="name" class="font-semibold w-60">Nom</label>
          <InputText v-model="form.name" id="name" class="w-full" required />
        </div>

        <!-- Prénom -->
        <div v-if="!form.organism" class="flex items-center gap-4">
          <label for="firstname" class="font-semibold w-60">Prénom</label>
          <InputText v-model="form.firstname" id="firstname" class="w-full" />
        </div>

        <!-- Sourds/entendant -->
        <div v-if="!form.organism" class="flex items-center gap-4">
          <label for="deaf" class="font-semibold w-60">Sourds/entendant</label>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="text-sm transition-colors"
              :class="form.deaf ? 'text-base-content/50' : 'text-base-content font-semibold'"
              @click="form.deaf = false"
              aria-label="Choisir Entendant(e)"
            >
              Entendant(e)
            </button>
            <ToggleSwitch v-model="form.deaf" inputId="deaf" />
            <button
              type="button"
              class="text-sm transition-colors"
              :class="form.deaf ? 'text-base-content font-semibold' : 'text-base-content/50'"
              @click="form.deaf = true"
              aria-label="Choisir Sourd(e)"
            >
              Sourd(e)
            </button>
          </div>
        </div>

        <!-- Date de naissance / création -->
        <div class="flex items-center gap-4">
          <label
            for="birthdate"
            class="font-semibold w-60"
            >{{ form.organism ? 'Date de création' : 'Date de naissance' }}</label
          >
          <DatePicker
            v-model="birthdateModel"
            inputId="birthdate"
            dateFormat="dd.mm.yy"
            class="w-full max-w-xs"
          />
        </div>

        <!-- Lieu de naissance / création -->
        <div class="flex items-center gap-4">
          <label
            for="birthplace"
            class="font-semibold w-60"
            >{{ form.organism ? 'Lieu de création' : 'Lieu de naissance' }}</label
          >
          <InputText v-model="form.birthplace" id="birthplace" class="w-full" />
        </div>

        <!-- Famille sourde/entendante -->
        <div v-if="!form.organism" class="flex items-center gap-4">
          <label for="deafFamily" class="font-semibold w-60">Famille</label>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="text-sm transition-colors"
              :class="form.deafFamily ? 'text-base-content/50' : 'text-base-content font-semibold'"
              @click="form.deafFamily = false"
              aria-label="Choisir Famille entendante"
            >
              Famille entendante
            </button>
            <ToggleSwitch v-model="form.deafFamily" inputId="deafFamily" />
            <button
              type="button"
              class="text-sm transition-colors"
              :class="form.deafFamily ? 'text-base-content font-semibold' : 'text-base-content/50'"
              @click="form.deafFamily = true"
              aria-label="Choisir Famille sourde"
            >
              Famille sourde
            </button>
          </div>
        </div>

        <!-- Précision sur la famille -->
        <div v-if="!form.organism" class="flex items-start gap-4">
          <label for="family" class="font-semibold w-60 pt-2">Précision sur la famille</label>
          <textarea
            v-model="form.family"
            id="family"
            class="textarea textarea-bordered w-full"
            rows="3"
            placeholder="Précisions supplémentaires sur la composition familiale..."
          ></textarea>
        </div>
        <!-- Signe associé -->
        <div class="flex items-center gap-4">
          <label for="sign" class="font-semibold w-60">Signe associé</label>
          <Select
            v-model="form.Sign"
            :options="signOptions"
            id="sign"
            class="w-full"
            optionLabel="label"
            optionValue="value"
            placeholder="Sélectionner un signe"
            show-clear
          />
        </div>
      </TabPanel>

      <TabPanel :value="1" class="space-y-4">
        <!-- Description -->
        <div class="flex items-start gap-4">
          <label for="description" class="font-semibold w-60 pt-2">Description</label>
          <div class="w-full">
            <VMarkdownEditor v-model="form.description" locale="en" class="h-64!" />
          </div>
        </div>
      </TabPanel>

      <TabPanel :value="2" class="space-y-4">
        <CategoriesPickerForm v-model="selectedCategories" />
      </TabPanel>

      <TabPanel :value="3" class="space-y-4">
        <div class="flex flex-col gap-4 w-full">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold text-lg">Entrées de la timeline</h3>
          </div>
          <div
            v-if="timeline && timeline.length === 0"
            class="text-center text-base-content/50 py-8"
          >
            Aucune entrée de timeline. Cliquez sur "Ajouter une entrée" pour commencer.
          </div>

          <div ref="timelineContainer">
            <div v-for="(entry, index) in timeline" :key="entry.id" class="card card-border">
              <!-- Mode édition -->
              <div v-if="editingBioIndex === index" class="space-y-3">
                <div class="flex justify-between items-start gap-4">
                  <div class="flex-1 space-y-3">
                    <!-- Titre -->
                    <div>
                      <label :for="`bio-title-${index}`" class="label text-sm font-semibold">
                        Titre
                      </label>
                      <InputText
                        v-model="entry.title"
                        :id="`bio-title-${index}`"
                        class="w-full"
                        placeholder="Ex: 1990-2000, Jeunesse, Formation..."
                      />
                    </div>

                    <!-- Description -->
                    <div>
                      <label :for="`bio-desc-${index}`" class="label text-sm font-semibold">
                        Description
                      </label>
                      <textarea
                        v-model="entry.description"
                        :id="`bio-desc-${index}`"
                        class="textarea textarea-bordered w-full"
                        rows="3"
                        placeholder="Description de cette période ou événement..."
                      ></textarea>
                    </div>
                  </div>

                  <div class="flex flex-col gap-2">
                    <!-- Bouton valider -->
                    <button
                      type="button"
                      @click="validateBioEntry()"
                      class="btn btn-square btn-sm btn-success btn-outline"
                      title="Valider cette entrée"
                    >
                      <span class="i-fa-solid-check"></span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Mode lecture compacte -->
              <div v-else class="flex justify-between items-start gap-4 p-4">
                <div class="flex items-start gap-3 flex-1">
                  <span
                    class="cursor-grab active:cursor-grabbing text-base-content/50 hover:text-base-content bio-handle flex-shrink-0 mt-1"
                  >
                    <span class="i-fa-solid-grip-vertical"></span>
                  </span>
                  <div class="flex-1">
                    <h4 class="font-semibold text-base mb-1">
                      {{ entry.title || '(Sans titre)' }}
                    </h4>
                    <p class="text-sm text-base-content/70">
                      {{ entry.description ||
                                            '(Sansdescription)' }}
                    </p>
                  </div>
                </div>

                <div class="flex gap-2">
                  <!-- Bouton éditer -->
                  <button
                    type="button"
                    @click="editBioEntry(index)"
                    class="btn btn-square btn-sm btn-outline"
                    title="Éditer cette entrée"
                  >
                    <span class="i-fa-solid-pen"></span>
                  </button>

                  <!-- Bouton supprimer -->
                  <button
                    type="button"
                    @click="removeBioEntry(index)"
                    class="btn btn-square btn-sm btn-error btn-outline"
                    title="Supprimer cette entrée"
                  >
                    <span class="i-fa-solid-times"></span>
                  </button>
                </div>
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

      <TabPanel :value="4" class="space-y-4">
        <div class="flex flex-col gap-4 w-full">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold text-lg">Vidéos</h3>
            <button type="button" @click="startAddVideo" class="btn btn-primary btn-sm">
              <span class="i-fa-solid-plus"></span>
              Ajouter une vidéo
            </button>
          </div>

          <div v-if="newVideoMode" class="card card-border p-4 mb-4">
            <div class="flex flex-col gap-4">
              <div>
                <label class="label text-sm font-semibold">Titre</label>
                <InputText
                  v-model="newVideo.title"
                  class="w-full"
                  placeholder="Titre de la vidéo"
                />
              </div>

              <div>
                <label class="label text-sm font-semibold">URL de la vidéo</label>
                <InputText
                  v-model="newVideo.url"
                  class="w-full"
                  placeholder="URL de la vidéo (YouTube, Vimeo...)"
                />
              </div>

              <div class="flex justify-end gap-2">
                <button type="button" @click="saveNewVideo" class="btn btn-success btn-sm">
                  <span class="i-fa-solid-check"></span>
                  Enregistrer
                </button>
                <button type="button" @click="cancelAddVideo" class="btn btn-error btn-sm">
                  <span class="i-fa-solid-times"></span>
                  Annuler
                </button>
              </div>
            </div>
          </div>

          <div ref="videosContainer">
            <div
              v-for="(video, index) in videos"
              :key="video.id"
              class="card card-border mb-4 hover:shadow-lg transition-shadow"
            >
              <!-- Mode édition -->
              <div v-if="editingVideoIndex === index" class="p-4">
                <div class="flex flex-col gap-4">
                  <div>
                    <label class="label text-sm font-semibold">Titre</label>
                    <InputText
                      v-model="editingVideo.title"
                      class="w-full"
                      placeholder="Titre de la vidéo"
                    />
                  </div>

                  <div>
                    <label class="label text-sm font-semibold">URL de la vidéo</label>
                    <InputText
                      v-model="editingVideo.url"
                      class="w-full"
                      placeholder="URL de la vidéo (YouTube, Vimeo...)"
                    />
                  </div>

                  <div class="flex justify-end gap-2">
                    <button
                      type="button"
                      @click="saveEditVideo(index)"
                      class="btn btn-success btn-sm"
                    >
                      <span class="i-fa-solid-check"></span>
                      Valider
                    </button>
                    <button type="button" @click="cancelEditVideo" class="btn btn-error btn-sm">
                      <span class="i-fa-solid-times"></span>
                      Annuler
                    </button>
                  </div>
                </div>
              </div>

              <!-- Mode lecture -->
              <div v-else class="flex justify-between items-center p-4">
                <div class="flex-1 flex items-center gap-3">
                  <span
                    class="cursor-grab active:cursor-grabbing text-base-content/50 hover:text-base-content handle"
                  >
                    <span class="i-fa-solid-grip-vertical"></span>
                  </span>
                  <div class="flex-1">
                    <h4 class="font-semibold text-base mb-1">{{ video.title }}</h4>
                    <p class="text-sm text-base-content/70">{{ video.url }}</p>
                  </div>
                </div>

                <div class="flex gap-2">
                  <!-- Bouton éditer -->
                  <button
                    type="button"
                    @click="startEditVideo(index)"
                    class="btn btn-square btn-sm btn-outline"
                    title="Éditer cette vidéo"
                  >
                    <span class="i-fa-solid-pen"></span>
                  </button>

                  <!-- Bouton supprimer -->
                  <button
                    type="button"
                    @click="removeVideo(index)"
                    class="btn btn-square btn-sm btn-error btn-outline"
                    title="Supprimer cette vidéo"
                  >
                    <span class="i-fa-solid-times"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';

dayjs.extend(customParseFormat);
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import ToggleSwitch from 'primevue/toggleswitch';
import { VMarkdownEditor } from 'vue3-markdown';
import useSigns from '../composables/useSigns';
import useVideos from '../composables/useVideos';
import { useSortableList } from '../composables/useSortableList';
import type { TPerson, TVideo } from '../../types';
import CategoriesPickerForm from './CategoriesPickerForm.vue';

// Internal type for timeline entries with mandatory ID for sorting
type TTimelineEntryWithId = TPerson.TTimelineEntry & { id: string };

const props = defineProps<{
    initialVideos?: TVideo.TRecord[]
}>();

const form = defineModel<TPerson.TForm>({ required: true });
const selectedCategories = defineModel<{ [parentId: string]: string[] }>('categories', { required: true });
const activeTab = ref(0);
const editingBioIndex = ref<number | null>(null);
const editingVideoIndex = ref<number | null>(null);
const newVideoMode = ref(false);
const newVideo = ref<TVideo.TForm>({ title: '', url: '' });
const editingVideo = ref<TVideo.TForm>({ title: '', url: '' });

// Calendar model for birthdate (Date)
const birthdateModel = ref<Date | null>(null);

const { signs, loadSigns } = useSigns();
const { addVideo, updateVideo, findVideoByUrl } = useVideos();
const signOptions = computed(() =>
    signs.value.map((s: any) => ({ label: s.name, value: s.id }))
);

// Utiliser le composable useSortableList pour les vidéos
const {
    items: videos,
    container: videosContainer,
    setItems: setVideos,
    getItemIds: getVideoIds
} = useSortableList<TVideo.TRecord>('videosContainer', [], {
    animation: 200,
    handle: '.handle',
});

// Utiliser le composable useSortableList pour la timeline
const {
    items: timeline,
    container: timelineContainer,
    setItems: setTimeline,
} = useSortableList<TTimelineEntryWithId>('timelineContainer', [], {
    animation: 200,
    handle: '.bio-handle',
});

watch(() => props.initialVideos, (newVal) => {
    if (newVal) {
        setVideos(newVal);
    }
}, { immediate: true });

// Initialize timeline when form is loaded from outside (e.g., loading person from DB)
// This will fire every time the modale opens with new data
watch(() => form.value.timeline, (newVal) => {
    if (newVal && newVal.length > 0) {
        // If current timeline exist and have same count, don't reinitialize (preserve order)
        if (timeline.value.length === newVal.length && timeline.value.length > 0) {
            return;
        }

        // Ensure each timeline entry has an id
        const timelineWithIds: TTimelineEntryWithId[] = newVal.map((h, idx) => ({
            ...h,
            id: h.id || `timeline-${idx}-${Date.now()}`
        }));
        setTimeline(timelineWithIds);
    } else if (newVal && newVal.length === 0) {
        setTimeline([]);
    }
}, { immediate: true });

onMounted(loadSigns);

watch(() => form.value.birthdate, (newVal) => {
  if (!newVal) {
    birthdateModel.value = null;
    return;
  }
  const parsed = dayjs(newVal);
  birthdateModel.value = parsed.isValid() ? parsed.toDate() : null;
}, { immediate: true });

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

// Initialize timeline if not present
if (!form.value.timeline) {
    form.value.timeline = [];
}

const addBioEntry = () => {
    const newEntry: TTimelineEntryWithId = {
        id: `bio-${Date.now()}`,
        title: '',
        description: ''
    };
    timeline.value = [...timeline.value, newEntry];
    // Synchronise form without the temporary IDs
    const timelineForForm = timeline.value.map(({ id, ...rest }) => rest);
    form.value.timeline = timelineForForm as TPerson.TTimelineEntry[];
    const newIndex = timeline.value.length - 1;
    editingBioIndex.value = newIndex;
};

const removeBioEntry = (index: number) => {
    timeline.value.splice(index, 1);
    timeline.value = [...timeline.value];
    // Synchronise form without the temporary IDs
    const timelineForForm = timeline.value.map(({ id, ...rest }) => rest);
    form.value.timeline = timelineForForm as TPerson.TTimelineEntry[];
    if (editingBioIndex.value === index) {
        editingBioIndex.value = null;
    } else if (editingBioIndex.value !== null && editingBioIndex.value > index) {
        editingBioIndex.value--;
    }
};

const editBioEntry = (index: number) => {
    editingBioIndex.value = index;
};

const validateBioEntry = () => {
    // Synchronise form without the temporary IDs
    const timelineForForm = timeline.value.map(({ id, ...rest }) => rest);
    form.value.timeline = timelineForForm as TPerson.TTimelineEntry[];
    editingBioIndex.value = null;
};

const startAddVideo = () => {
    newVideo.value = { title: '', url: '' };
    newVideoMode.value = true;
    editingVideoIndex.value = null;
};

const cancelAddVideo = () => {
    newVideoMode.value = false;
};

const saveNewVideo = async () => {
    try {
        let videoRecord: TVideo.TRecord;

        // Check if video already exists
        const existing = await findVideoByUrl(newVideo.value.url);
        if (existing) {
            videoRecord = existing;
            // Update title if changed
            if (newVideo.value.title && newVideo.value.title !== existing.title) {
                videoRecord = await updateVideo(existing.id, {
                    title: newVideo.value.title,
                    url: existing.url
                });
            }
        } else {
            videoRecord = await addVideo(newVideo.value);
        }

        // Check if already linked to this person
        if (videos.value.some(v => v.id === videoRecord.id)) {
            // Already linked, just close mode (or maybe show message)
            newVideoMode.value = false;
            return;
        }

        videos.value = [...videos.value, videoRecord];
        form.value.Videos = getVideoIds();
        newVideoMode.value = false;
    } catch (e) {
        console.error(e);
        // Handle error (maybe show toast)
    }
};

const startEditVideo = (index: number) => {
    const video = videos.value[index];
    editingVideo.value = { ...video };
    editingVideoIndex.value = index;
    newVideoMode.value = false;
};

const cancelEditVideo = () => {
    editingVideoIndex.value = null;
};

const saveEditVideo = async (index: number) => {
    const video = videos.value[index];
    try {
        const updated = await updateVideo(video.id, editingVideo.value);
        videos.value[index] = updated;
        videos.value = [...videos.value];
        editingVideoIndex.value = null;
    } catch (e) {
        console.error(e);
    }
};

const removeVideo = (index: number) => {
    videos.value.splice(index, 1);
    videos.value = [...videos.value];

    // Mettre à jour le formulaire
    form.value.Videos = getVideoIds();

    // Si on supprime la vidéo en cours d'édition, désactiver le mode édition
    if (editingVideoIndex.value === index) {
        editingVideoIndex.value = null;
    } else if (editingVideoIndex.value !== null && editingVideoIndex.value > index) {
        editingVideoIndex.value--;
    }
};

// Sync lists order to form before saving
// This ensures the sorted order from drag & drop is saved to the backend
const syncListsBeforeSave = () => {
    const timelineForForm = timeline.value.map(({ id, ...rest }) => rest);
    form.value.timeline = timelineForForm as TPerson.TTimelineEntry[];
    form.value.Videos = getVideoIds();
    form.value.birthdate = birthdateModel.value ? dayjs(birthdateModel.value).format('YYYY-MM-DD') : undefined as any;
};

defineExpose({ syncListsBeforeSave });
</script>
