<template>
  <div class="max-w-3xl mx-auto px-4">
    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <template v-else-if="tool">
      <h1 class="text-3xl font-bold mb-2">{{ tool.name }}</h1>
      <p v-if="tool.description" class="text-base-content/70 mb-6">{{ tool.description }}</p>
      <div class="alert mb-6 text-sm">
        <span class="i-fa-solid-info-circle"></span>
        <span>
          Décompressez l'archive, puis double-cliquez sur <strong>start.command</strong>. Au premier
          lancement, macOS demande une confirmation : clic droit sur le fichier, puis « Ouvrir ».
        </span>
      </div>
      <ToolReleases :releases="releases" @error="showPbError" />
    </template>

    <p v-else class="text-center py-16 text-base-content/60">
      Cet outil n'est pas disponible pour votre compte.
    </p>
    <PbErrorToast />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import useAuth from '@admin/composables/useAuth'
import useTools, { SPLITTER_SLUG } from '@admin/composables/useTools'
import usePbErrorToast from '@admin/composables/usePbErrorToast'
import PbErrorToast from '@admin/components/PbErrorToast.vue'
import ToolReleases from './ToolReleases.vue'

const { isAuthenticated } = useAuth()
const { tool, releases, loadTool, loadReleases } = useTools()
const { showPbError } = usePbErrorToast()
const loading = ref(true)

onMounted(async () => {
  if (!isAuthenticated.value) {
    sessionStorage.setItem('returnUrl', window.location.pathname)
    window.location.href = '/'
    return
  }
  try {
    const found = await loadTool(SPLITTER_SLUG)
    if (found) {
      await loadReleases(found.id)
    }
  } catch (error) {
    showPbError(error)
  } finally {
    loading.value = false
  }
})
</script>
