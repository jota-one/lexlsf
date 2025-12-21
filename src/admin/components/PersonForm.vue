<template>
  <Tabs v-model:value="activeTab" class="w-full">
    <TabList>
      <Tab :value="0">Informations</Tab>
      <Tab :value="1">Description</Tab>
      <Tab :value="2">Catégories</Tab>
      <Tab :value="3">Bio</Tab>
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

        <!-- Nom -->
        <div class="flex items-center gap-4">
          <label for="name" class="font-semibold w-60">Nom</label>
          <InputText v-model="form.name" id="name" class="w-full" required />
        </div>

        <!-- Sourds/entendant -->
        <div class="flex items-center gap-4">
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

        <!-- Date de naissance -->
        <div class="flex items-center gap-4">
          <label for="birthdate" class="font-semibold w-60">Date de naissance</label>
          <DatePicker
            v-model="birthdateModel"
            inputId="birthdate"
            dateFormat="dd.mm.yy"
            class="w-full max-w-xs"
          />
        </div>

        <!-- Lieu de naissance -->
        <div class="flex items-center gap-4">
          <label for="birthplace" class="font-semibold w-60">Lieu de naissance</label>
          <InputText v-model="form.birthplace" id="birthplace" class="w-full" />
        </div>

        <!-- Famille sourde/entendante -->
        <div class="flex items-center gap-4">
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
        <div class="flex items-start gap-4">
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
          <textarea
            v-model="form.description"
            id="description"
            class="textarea textarea-bordered w-full"
            rows="4"
            placeholder="Description de la personne"
          ></textarea>
        </div>
      </TabPanel>

      <TabPanel :value="2" class="space-y-4">
        <div class="flex flex-col gap-4 w-full">
          <template v-for="parent in parentCategories" :key="parent.id">
            <div>
              <span class="font-semibold mb-2 block">{{ parent.tag }}</span>
              <div class="flex flex-wrap gap-2">
                <template v-for="child in childCategoryOptions(parent)" :key="child.id">
                  <input
                    type="checkbox"
                    :id="`person-cat-${parent.id}-${child.id}`"
                    :value="child.id"
                    :checked="selectedCategories[parent.id]?.includes(child.id)"
                    @change="toggleCategory(parent.id, child.id)"
                    class="sr-only"
                  />
                  <label
                    :for="`person-cat-${parent.id}-${child.id}`"
                    class="badge badge-sm cursor-pointer"
                    :class="selectedCategories[parent.id]?.includes(child.id) ? 'badge-primary' : ''"
                  >
                    {{ child.tag }}
                  </label>
                </template>
              </div>
            </div>
          </template>
        </div>
      </TabPanel>

      <TabPanel :value="3" class="space-y-4">
        <div class="flex flex-col gap-4 w-full">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold text-lg">Entrées biographiques</h3>
          </div>
          <div
            v-if="highlights && highlights.length === 0"
            class="text-center text-base-content/50 py-8"
          >
            Aucune entrée biographique. Cliquez sur "Ajouter une entrée" pour commencer.
          </div>

          <div ref="highlightsContainer">
            <div v-for="(entry, index) in highlights" :key="entry.id" class="card card-border">
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
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import ToggleSwitch from 'primevue/toggleswitch';
import useCategories from '../composables/useCategories';
import useSigns from '../composables/useSigns';
import useVideos from '../composables/useVideos';
import { useSortableList } from '../composables/useSortableList';
import type { TPerson, TVideo } from '../../types';

// Internal type for highlights with mandatory ID for sorting
type TBioEntryWithId = TPerson.TBioEntry & { id: string };

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

const { categories, loadCategories } = useCategories();

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

// Utiliser le composable useSortableList pour les highlights
const {
    items: highlights,
    container: highlightsContainer,
    setItems: setHighlights,
} = useSortableList<TBioEntryWithId>('highlightsContainer', [], {
    animation: 200,
    handle: '.bio-handle',
});

watch(() => props.initialVideos, (newVal) => {
    if (newVal) {
        setVideos(newVal);
    }
}, { immediate: true });

// Initialize highlights when form is loaded from outside (e.g., loading person from DB)
// This will fire every time the modale opens with new data
watch(() => form.value.highlights, (newVal) => {
    if (newVal && newVal.length > 0) {
        // If current highlights exist and have same count, don't reinitialize (preserve order)
        if (highlights.value.length === newVal.length && highlights.value.length > 0) {
            return;
        }

        // Ensure each highlight has an id
        const highlightsWithIds: TBioEntryWithId[] = newVal.map((h, idx) => ({
            ...h,
            id: h.id || `bio-${idx}-${Date.now()}`
        }));
        setHighlights(highlightsWithIds);
    } else if (newVal && newVal.length === 0) {
        setHighlights([]);
    }
}, { immediate: true });

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
      selectedCategories.value[parent.id] = [];
    }
    });
});

const toggleCategory = (parentId: string, childId: string) => {
    // Ensure it's an array
    if (!Array.isArray(selectedCategories.value[parentId])) {
        selectedCategories.value[parentId] = [];
    }
    const categories = selectedCategories.value[parentId] as string[];
    const index = categories.indexOf(childId);
    if (index > -1) {
        categories.splice(index, 1);
    } else {
        categories.push(childId);
    }
};

onMounted(() => {
    loadCategories('person');
    loadSigns();
  // initialize birthdateModel from form.birthdate
  // Supported inputs:
  // - Full ISO string from DB: e.g. "1950-05-07 00:00:00.000Z" or "1950-05-07T00:00:00.000Z"
  // - ISO date: "YYYY-MM-DD"
  // - French: "DD.MM.YYYY"
  if (form.value.birthdate) {
    const s = form.value.birthdate.trim();
    // Try native Date parsing for ISO-like strings
    const parsedMs = Date.parse(s.replace(' ', 'T'));
    if (!Number.isNaN(parsedMs)) {
      birthdateModel.value = new Date(parsedMs);
    } else {
      const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
      if (iso) {
        birthdateModel.value = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
      } else {
        const fr = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s);
        if (fr) {
          birthdateModel.value = new Date(Number(fr[3]), Number(fr[2]) - 1, Number(fr[1]));
        }
      }
    }
    // Normalize time to local midnight for consistent Calendar display
    if (birthdateModel.value instanceof Date) {
      birthdateModel.value.setHours(0, 0, 0, 0);
    }
  }
});

// Keep DatePicker model in sync when form.birthdate changes (e.g., reopening modal)
watch(() => form.value.birthdate, (newVal) => {
  if (!newVal) {
    birthdateModel.value = null;
    return;
  }
  const s = newVal.trim();
  const parsedMs = Date.parse(s.replace(' ', 'T'));
  if (!Number.isNaN(parsedMs)) {
    birthdateModel.value = new Date(parsedMs);
  } else {
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (iso) {
      birthdateModel.value = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    } else {
      const fr = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s);
      if (fr) {
        birthdateModel.value = new Date(Number(fr[3]), Number(fr[2]) - 1, Number(fr[1]));
      } else {
        birthdateModel.value = null;
      }
    }
  }
  if (birthdateModel.value instanceof Date) {
    birthdateModel.value.setHours(0, 0, 0, 0);
  }
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

// Initialize highlights if not present
if (!form.value.highlights) {
    form.value.highlights = [];
}

const addBioEntry = () => {
    const newEntry: TBioEntryWithId = {
        id: `bio-${Date.now()}`,
        title: '',
        description: ''
    };
    highlights.value = [...highlights.value, newEntry];
    // Synchronise form without the temporary IDs
    const highlightsForForm = highlights.value.map(({ id, ...rest }) => rest);
    form.value.highlights = highlightsForForm as TPerson.TBioEntry[];
    const newIndex = highlights.value.length - 1;
    editingBioIndex.value = newIndex;
};

const removeBioEntry = (index: number) => {
    highlights.value.splice(index, 1);
    highlights.value = [...highlights.value];
    // Synchronise form without the temporary IDs
    const highlightsForForm = highlights.value.map(({ id, ...rest }) => rest);
    form.value.highlights = highlightsForForm as TPerson.TBioEntry[];
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
    const highlightsForForm = highlights.value.map(({ id, ...rest }) => rest);
    form.value.highlights = highlightsForForm as TPerson.TBioEntry[];
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
    const highlightsForForm = highlights.value.map(({ id, ...rest }) => rest);
    form.value.highlights = highlightsForForm as TPerson.TBioEntry[];
    form.value.Videos = getVideoIds();
  // sync birthdate string from Calendar model using ISO for backend
  if (birthdateModel.value instanceof Date) {
    const y = birthdateModel.value.getFullYear();
    const m = String(birthdateModel.value.getMonth() + 1).padStart(2, '0');
    const d = String(birthdateModel.value.getDate()).padStart(2, '0');
    form.value.birthdate = `${y}-${m}-${d}`;
  } else if (!birthdateModel.value) {
    form.value.birthdate = undefined as any;
  }
};

defineExpose({ syncListsBeforeSave });
</script>
