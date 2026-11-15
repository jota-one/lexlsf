<template>
  <div class="p-8 max-w-4xl">
    <h2 class="text-2xl font-bold mb-2 flex items-center gap-2">
      <span class="i-fa-solid-cut"></span>
      Découpeur de signes
    </h2>
    <p class="text-sm text-base-content/70 mb-6">
      Les personnes choisies ici le téléchargent depuis le menu de leur compte. Le lien de
      téléchargement ne fonctionne pour personne d'autre.
    </p>

    <div v-if="loading" class="flex justify-center py-10">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <template v-else-if="tool">
      <!-- Who may download -->
      <section class="card bg-base-200 p-6 mb-6 space-y-3">
        <h3 class="font-semibold text-lg">Personnes autorisées</h3>
        <p class="text-xs text-base-content/60">Les admins y ont toujours accès.</p>
        <MultiSelect
          v-model="allowedUserIds"
          :options="selectableUsers"
          :optionLabel="userLabel"
          optionValue="id"
          placeholder="Choisir des personnes…"
          display="chip"
          filter
          filterPlaceholder="Rechercher une personne…"
          class="w-full"
        />
        <div class="flex justify-end">
          <Button
            type="button"
            label="Enregistrer"
            size="small"
            :loading="savingUsers"
            :disabled="!usersChanged"
            @click="saveUsers"
          />
        </div>
      </section>

      <!-- Publish a version -->
      <section class="card bg-base-200 p-6 mb-6 space-y-3">
        <h3 class="font-semibold text-lg">Publier une version</h3>
        <div class="flex flex-col gap-1">
          <label for="tool-version" class="text-sm font-semibold">Version</label>
          <InputText id="tool-version" v-model="form.version" placeholder="ex. 1.1" class="w-40" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="tool-changelog" class="text-sm font-semibold">Ce qui change</label>
          <Textarea
            id="tool-changelog"
            v-model="form.changelog"
            rows="4"
            placeholder="- Les clips sortent directement au format du site"
            class="w-full"
          />
          <span class="text-xs text-base-content/60">
            Une ligne par changement, en commençant par « - ».
          </span>
        </div>
        <div class="flex flex-col gap-1">
          <label for="tool-file" class="text-sm font-semibold">Archive</label>
          <input
            id="tool-file"
            ref="fileInput"
            type="file"
            accept=".zip,.dmg"
            class="file-input file-input-bordered w-full"
            @change="onFileChange"
          />
          <span class="text-xs text-base-content/60">
            L'archive préparée par <code>apps/video-splitter/pack.sh</code> (200 Mo au plus).
          </span>
        </div>
        <div class="flex justify-end">
          <Button
            type="button"
            label="Publier"
            icon="i-fa-solid-upload"
            size="small"
            :loading="publishing"
            :disabled="!canPublish"
            @click="publish"
          />
        </div>
      </section>

      <!-- Versions -->
      <section class="space-y-3">
        <h3 class="font-semibold text-lg">Versions publiées</h3>
        <ToolReleases
          :releases="releases"
          can-delete
          @delete="confirmDelete"
          @error="showPbError"
        />
      </section>
    </template>

    <p v-else class="text-base-content/60">
      L'outil est introuvable : la migration qui le crée n'a peut-être pas encore été appliquée.
    </p>

    <ConfirmModal
      v-model="showDeleteModal"
      title="Supprimer cette version ?"
      :message="deleteMessage"
      @confirm="deleteConfirmed"
    />
    <PbErrorToast />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import MultiSelect from 'primevue/multiselect'
import useTools, { SPLITTER_SLUG } from '@admin/composables/useTools'
import useUsers, { type TUser } from '@admin/composables/useUsers'
import usePbErrorToast from '@admin/composables/usePbErrorToast'
import ConfirmModal from '@admin/components/ConfirmModal.vue'
import PbErrorToast from '@admin/components/PbErrorToast.vue'
import ToolReleases from '@components/tools/ToolReleases.vue'
import type { ToolReleaseResponse } from '@types'

const { tool, releases, loadTool, loadReleases, publishRelease, deleteRelease, saveAllowedUsers } =
  useTools()
const { users, loadUsers } = useUsers()
const { showPbError } = usePbErrorToast()

const loading = ref(true)

/* ---- Allowed users ---- */

// Admins always have access: only the other accounts are worth choosing.
const selectableUsers = computed(() =>
  users.value.filter(user => !user.expand?.roles?.some(role => role.slug === 'admin')),
)
const userLabel = (user: TUser) => (user.name ? `${user.name} (${user.email})` : user.email)
const allowedUserIds = ref<string[]>([])
const savingUsers = ref(false)
const usersChanged = computed(() => {
  const saved = [...(tool.value?.allowed_users ?? [])].sort().join()
  return saved !== [...allowedUserIds.value].sort().join()
})

const saveUsers = async () => {
  if (!tool.value) {
    return
  }
  savingUsers.value = true
  try {
    await saveAllowedUsers(tool.value.id, allowedUserIds.value)
  } catch (error) {
    showPbError(error)
  } finally {
    savingUsers.value = false
  }
}

/* ---- Publish ---- */

const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const form = ref<{ version: string; changelog: string; file: File | null }>({
  version: '',
  changelog: '',
  file: null,
})
const publishing = ref(false)
const canPublish = computed(() => Boolean(form.value.version.trim() && form.value.file))

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  form.value.file = input.files?.[0] ?? null
}

const publish = async () => {
  if (!tool.value || !form.value.file) {
    return
  }
  publishing.value = true
  try {
    await publishRelease(tool.value.id, {
      version: form.value.version,
      changelog: form.value.changelog,
      file: form.value.file,
    })
    form.value = { version: '', changelog: '', file: null }
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    await loadReleases(tool.value.id)
  } catch (error) {
    showPbError(error)
  } finally {
    publishing.value = false
  }
}

/* ---- Delete ---- */

const showDeleteModal = ref(false)
const releaseToDelete = ref<ToolReleaseResponse | null>(null)
const deleteMessage = computed(
  () =>
    `La version ${releaseToDelete.value?.version ?? ''} et son archive seront supprimées définitivement.`,
)

const confirmDelete = (release: ToolReleaseResponse) => {
  releaseToDelete.value = release
  showDeleteModal.value = true
}

const deleteConfirmed = async () => {
  if (!releaseToDelete.value || !tool.value) {
    return
  }
  try {
    await deleteRelease(releaseToDelete.value.id)
    await loadReleases(tool.value.id)
  } catch (error) {
    showPbError(error)
  } finally {
    showDeleteModal.value = false
    releaseToDelete.value = null
  }
}

onMounted(async () => {
  try {
    const [found] = await Promise.all([loadTool(SPLITTER_SLUG), loadUsers()])
    if (found) {
      allowedUserIds.value = [...found.allowed_users]
      await loadReleases(found.id)
    }
  } catch (error) {
    showPbError(error)
  } finally {
    loading.value = false
  }
})
</script>
