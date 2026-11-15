<template>
  <p v-if="releases.length === 0" class="text-base-content/60">
    Aucune version publiée pour le moment.
  </p>
  <ol v-else class="space-y-4">
    <li v-for="(release, index) in releases" :key="release.id" class="card bg-base-100 shadow-sm">
      <div class="card-body p-4 gap-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="font-semibold text-lg flex items-center gap-2">
            Version {{ release.version }}
            <span v-if="index === 0" class="badge badge-sm badge-secondary">Dernière</span>
          </h3>
          <div class="flex items-center gap-2">
            <span class="text-sm text-base-content/60">{{ formatDate(release.created) }}</span>
            <button
              type="button"
              class="btn btn-sm"
              :class="index === 0 ? 'btn-secondary' : 'btn-ghost'"
              :disabled="downloadingId === release.id"
              @click="download(release)"
            >
              <span
                v-if="downloadingId === release.id"
                class="loading loading-spinner loading-xs"
              ></span>
              <span v-else class="i-fa-solid-download"></span>
              Télécharger
            </button>
            <button
              v-if="canDelete"
              type="button"
              class="btn btn-sm btn-ghost"
              title="Supprimer cette version"
              @click="emit('delete', release)"
            >
              <span class="i-fa-solid-trash"></span>
            </button>
          </div>
        </div>
        <div
          v-if="release.changelog"
          class="prose prose-sm max-w-none"
          v-html="changelogHtml(release.changelog)"
        ></div>
        <p v-else class="text-sm text-base-content/50">Pas de description.</p>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import { marked } from 'marked'
import useTools from '@admin/composables/useTools'
import type { ToolReleaseResponse } from '@types'

type Props = {
  /** Newest first: the first one is shown as the latest version. */
  releases: ToolReleaseResponse[]
  canDelete?: boolean
}
type Events = {
  delete: [release: ToolReleaseResponse]
  error: [error: unknown]
}

defineProps<Props>()
const emit = defineEmits<Events>()

const { downloadUrl } = useTools()
const downloadingId = ref<string | null>(null)

const formatDate = (date: string) => dayjs(date).format('DD.MM.YYYY')

// The changelog is written by an admin, in Markdown (lists, bold…).
const changelogHtml = (text: string) => String(marked.parse(text))

const download = async (release: ToolReleaseResponse) => {
  downloadingId.value = release.id
  try {
    window.location.href = await downloadUrl(release)
  } catch (error) {
    emit('error', error)
  } finally {
    downloadingId.value = null
  }
}
</script>
