<template>
  <Tabs v-model:value="activeTab" class="w-full">
    <TabList>
      <Tab :value="0">Informations</Tab>
      <Tab :value="1">Médias</Tab>
      <Tab :value="2">Associations</Tab>
    </TabList>

    <TabPanels>
      <!-- Onglet Informations -->
      <TabPanel :value="0" class="space-y-4">
        <!-- Nom -->
        <div class="flex items-center gap-4">
          <label for="gc-name" class="font-semibold w-60">Nom / Titre</label>
          <InputText v-model="form.name" id="gc-name" class="w-full" required />
        </div>

        <!-- Slug -->
        <div class="flex items-center gap-4">
          <label for="gc-slug" class="font-semibold w-60">Slug</label>
          <div class="flex gap-2 w-full">
            <InputText
              v-model="form.slug"
              id="gc-slug"
              class="flex-1"
              placeholder="Auto-généré depuis le nom"
            />
            <Button
              icon="i-fa6-solid-arrows-rotate"
              severity="secondary"
              size="small"
              @click="regenerateSlug"
              v-tooltip="'Régénérer depuis le nom'"
            />
          </div>
        </div>

        <!-- Dates -->
        <div class="flex items-start gap-4">
          <label class="font-semibold w-60 pt-2">Date de début</label>
          <DatePartInput v-model="form.start_date" required />
        </div>

        <div class="flex items-start gap-4">
          <label class="font-semibold w-60 pt-2">
            Date de fin
            <span class="block text-xs font-normal text-base-content/50">Laisser vide si événement ponctuel</span>
          </label>
          <DatePartInput v-model="form.end_date" />
        </div>

        <!-- Description -->
        <div class="flex items-start gap-4">
          <label for="gc-description" class="font-semibold w-60 pt-2">
            Description
            <span class="block text-xs font-normal text-base-content/50">Markdown</span>
          </label>
          <textarea
            v-model="form.description"
            id="gc-description"
            class="textarea textarea-bordered w-full"
            rows="8"
            placeholder="Description en markdown..."
          ></textarea>
        </div>

        <!-- Visible pour (rôles) -->
        <div class="flex items-center gap-4">
          <label class="font-semibold w-60">Visible pour</label>
          <div class="flex flex-wrap gap-2 w-full">
            <span v-if="rolesLoading" class="loading loading-spinner loading-sm"></span>
            <template v-else>
              <button
                v-for="role in roles"
                :key="role.id"
                type="button"
                class="badge badge-md"
                :class="roleBadgeClass(role)"
                :title="role.slug === 'admin' ? 'Toujours autorisé (automatique)' : ''"
                @click="toggleRole(role)"
              >
                {{ role.name }}
                <span v-if="role.slug === 'admin'" class="ml-1 i-fa6-solid-lock text-xs"></span>
              </button>
            </template>
          </div>
        </div>
      </TabPanel>

      <!-- Onglet Médias -->
      <TabPanel :value="1" class="space-y-4">
        <!-- Images existantes -->
        <div v-if="existingImages.length > 0">
          <p class="text-sm font-semibold mb-2">
            Images existantes
            <span class="text-xs font-normal text-base-content/50 ml-2">Cliquer sur une image pour copier son lien markdown</span>
          </p>
          <div class="flex flex-wrap gap-3">
            <div
              v-for="filename in existingImages"
              :key="filename"
              class="relative group cursor-pointer"
              @click="copyMarkdown(filename)"
              v-tooltip="copiedFilename === filename ? 'Copié !' : 'Copier en markdown'"
            >
              <img
                :src="previewUrl(filename)"
                class="w-24 h-20 object-cover rounded-lg border transition-all"
                :class="copiedFilename === filename ? 'border-success opacity-70' : 'border-base-300'"
                :alt="filename"
              />
              <div
                v-if="copiedFilename === filename"
                class="absolute inset-0 flex items-center justify-center rounded-lg bg-success/20"
              >
                <span class="i-fa-solid-check text-success text-lg"></span>
              </div>
              <button
                type="button"
                class="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                @click.stop="removeExistingImage(filename)"
                v-tooltip="'Supprimer'"
              >
                <span class="i-fa-solid-times text-xs"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Upload de nouvelles images -->
        <div>
          <p class="text-sm font-semibold mb-2">Ajouter des images</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            class="file-input file-input-bordered w-full"
            @change="onFilesChange"
          />
        </div>

        <!-- Aperçu nouvelles images -->
        <div v-if="newImagePreviews.length > 0">
          <p class="text-sm font-semibold mb-2">À uploader</p>
          <div class="flex flex-wrap gap-3">
            <div
              v-for="(preview, index) in newImagePreviews"
              :key="index"
              class="relative group"
            >
              <img
                :src="preview.url"
                class="w-24 h-20 object-cover rounded-lg border border-base-300"
                :alt="preview.name"
              />
              <button
                type="button"
                class="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                @click="removeNewImage(index)"
                v-tooltip="'Annuler'"
              >
                <span class="i-fa-solid-times text-xs"></span>
              </button>
            </div>
          </div>
        </div>

        <p v-if="existingImages.length === 0 && newImagePreviews.length === 0" class="text-sm text-base-content/50">
          Aucune image pour le moment.
        </p>

        <p class="text-xs text-base-content/40">
          Les URLs des images uploadées pourront être utilisées dans la description markdown.<br>
          Format: <code>/api/files/general_culture/{record_id}/{filename}</code>
        </p>
      </TabPanel>

      <!-- Onglet Associations -->
      <TabPanel :value="2" class="space-y-6">
        <!-- Champs lexicaux -->
        <div class="flex items-start gap-4">
          <label class="font-semibold w-60 pt-1">Champs lexicaux</label>
          <div class="flex-1">
            <LexicalFieldPicker v-model="form.LexicalFields" />
          </div>
        </div>

        <!-- Signes -->
        <div class="flex items-start gap-4">
          <label class="font-semibold w-60 pt-1">Signes associés</label>
          <div class="flex-1">
            <SignPicker mode="multi" v-model="form.Signs" />
          </div>
        </div>

        <!-- Personnes / Organismes -->
        <div class="flex items-start gap-4">
          <label class="font-semibold w-60 pt-1">Personnes / Organismes</label>
          <div class="flex-1">
            <PersonMultiPicker v-model="form.Persons" />
          </div>
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import useRoles from '../composables/useRoles'
import useAuth from '../composables/useAuth'
import type { TGeneralCulture } from '../../types'
import SignPicker from './SignPicker.vue'
import PersonMultiPicker from './PersonMultiPicker.vue'
import LexicalFieldPicker from './LexicalFieldPicker.vue'
import DatePartInput from './DatePartInput.vue'
import { createSlug } from '@admin/helpers/strings'

const form = defineModel<TGeneralCulture.TForm>({ required: true })

const activeTab = ref(0)
const { roles, loadRoles } = useRoles()
const { pb } = useAuth()
const rolesLoading = ref(false)
const adminRoleId = ref('')

// Images
type Preview = { url: string; name: string; file: File }
const newImagePreviews = ref<Preview[]>([])
const existingImages = computed(() => {
  const removed = new Set(form.value.removedImages || [])
  return (props.existingImageFilenames || []).filter(f => !removed.has(f))
})

type Props = {
  existingImageFilenames?: string[]
  recordId?: string
}
const props = withDefaults(defineProps<Props>(), {
  existingImageFilenames: () => [],
  recordId: '',
})

const previewUrl = (filename: string) =>
  pb.files.getURL({ id: props.recordId, collectionName: 'general_culture' }, filename, { thumb: '400x300' })

const onFilesChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  const files = Array.from(input.files)
  const previews = files.map(file => ({
    url: URL.createObjectURL(file),
    name: file.name,
    file,
  }))
  newImagePreviews.value = [...newImagePreviews.value, ...previews]
  form.value.newImages = [...(form.value.newImages || []), ...files]
  input.value = ''
}

const removeNewImage = (index: number) => {
  const preview = newImagePreviews.value[index]
  URL.revokeObjectURL(preview.url)
  newImagePreviews.value = newImagePreviews.value.filter((_, i) => i !== index)
  form.value.newImages = (form.value.newImages || []).filter((_, i) => i !== index)
}

const removeExistingImage = (filename: string) => {
  form.value.removedImages = [...(form.value.removedImages || []), filename]
}

const copiedFilename = ref('')
const { copy } = useClipboard()
const copyMarkdown = async (filename: string) => {
  const url = pb.files.getURL({ id: props.recordId, collectionName: 'general_culture' }, filename)
  const markdown = `![image](${url})`
  await copy(markdown)
  copiedFilename.value = filename
  setTimeout(() => { copiedFilename.value = '' }, 2000)
}

// Roles
watch(roles, () => {
  adminRoleId.value = roles.value.find(r => r.slug === 'admin')?.id || ''
  if (!adminRoleId.value || !Array.isArray(form.value.Roles)) return
  form.value.Roles = form.value.Roles.filter(id => id !== adminRoleId.value)
})

const isRoleSelected = (roleId: string) => {
  if (!roleId) return false
  if (roleId === adminRoleId.value) return true
  return (form.value.Roles || []).includes(roleId)
}

const toggleRole = (role: { id: string; slug: string }) => {
  if (role.slug === 'admin') return
  if ((form.value.Roles || []).includes(role.id)) {
    form.value.Roles = (form.value.Roles || []).filter(id => id !== role.id)
    return
  }
  form.value.Roles = [...(form.value.Roles || []), role.id]
}

const roleBadgeClass = (role: { id: string; slug: string }) => {
  if (role.slug === 'admin') return 'badge-primary opacity-60 cursor-not-allowed'
  return isRoleSelected(role.id) ? 'badge-primary cursor-pointer' : 'cursor-pointer'
}

// Slug
const regenerateSlug = () => {
  if (form.value.name) form.value.slug = createSlug(form.value.name)
}

watch(() => form.value.name, (val) => {
  if (!form.value.slug && val) form.value.slug = createSlug(val)
})

onMounted(() => {
  rolesLoading.value = true
  loadRoles().finally(() => (rolesLoading.value = false))
})
</script>
