<template>
  <Dialog
    :visible="modelValue"
    modal
    :closable="true"
    :style="{ width: '50rem' }"
    @update:visible="$emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <span class="i-fa-solid-file-import-export text-xl"></span>
        <span class="font-bold">Import / Export des signes</span>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Export Section -->
      <div class="card bg-base-200 p-4">
        <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <span class="i-fa-solid-file-export"></span>
          Export
        </h3>
        <p class="text-sm mb-4">Exporter tous les signes dans un fichier CSV.</p>
        <div class="flex gap-2">
          <Button
            label="Exporter en CSV"
            icon="i-fa-solid-file-csv"
            @click="handleExportCSV"
            :loading="isExporting"
            :disabled="isExporting || isImporting"
            severity="secondary"
          />
        </div>
      </div>

      <!-- Import Section -->
      <div class="card bg-base-200 p-4">
        <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <span class="i-fa-solid-file-import"></span>
          Import
        </h3>
        <p class="text-sm mb-4">
          Importer des signes depuis un fichier CSV. Les signes existants (par ID) seront mis à
          jour, les nouveaux seront créés.
        </p>

        <!-- File input -->
        <div class="mb-4">
          <input
            ref="fileInput"
            type="file"
            accept=".csv"
            @change="handleFileSelect"
            class="file-input file-input-bordered w-full"
          />
        </div>

        <!-- Import button -->
        <Button
          label="Importer le fichier"
          icon="i-fa-solid-upload"
          @click="handleImport"
          :loading="isImporting"
          :disabled="!selectedFile || isExporting || isImporting"
          severity="primary"
        />
      </div>

      <!-- Import Results -->
      <div v-if="importResult" class="card bg-base-200 p-4">
        <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <span class="i-fa-solid-clipboard-check"></span>
          Résultats de l'import
        </h3>

        <div class="alert alert-info mb-3">
          <span class="i-fa-solid-list-check"></span>
          <span>
            {{ importResult.processed }} signe(s) traité(s) —
            {{ importResult.created }} nouveau(x), {{ importResult.updated }} mis à jour,
            {{ importResult.unchanged }} inchangé(s)
          </span>
        </div>

        <div
          class="alert alert-success mb-3"
          v-if="importResult.success > 0 && importResult.errors.length === 0"
        >
          <span class="i-fa-solid-check-circle"></span>
          <span>Import terminé sans erreur</span>
        </div>

        <div v-if="importResult.errors.length > 0" class="space-y-2">
          <div class="alert alert-error">
            <span class="i-fa-solid-exclamation-triangle"></span>
            <span>{{ importResult.errors.length }} erreur(s) rencontrée(s)</span>
          </div>

          <div class="overflow-auto max-h-60">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Ligne</th>
                  <th>Terme</th>
                  <th>Erreur</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="error in importResult.errors" :key="`error-${error.line}`">
                  <td>{{ error.line }}</td>
                  <td>{{ error.name }}</td>
                  <td class="text-error">{{ error.error }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Help Section -->
      <div class="card bg-base-100 p-4 border border-base-300">
        <h3 class="text-sm font-semibold mb-2 flex items-center gap-2">
          <span class="i-fa-solid-info-circle"></span>
          Format des fichiers
        </h3>
        <div class="text-xs space-y-2">
          <p>
            <strong>CSV:</strong> Les colonnes attendues sont : {{ columnsList }}.
          </p>
          <p class="text-warning">
            <strong>Note:</strong> Les fichiers vidéo ne sont pas inclus dans l'import/export.
            Ils doivent être gérés séparément.
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <Button
          label="Fermer"
          severity="secondary"
          @click="$emit('update:modelValue', false)"
          :disabled="isExporting || isImporting"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import useSignsImportExport from '../composables/useSignsImportExport'
import type { TImportExport } from '../types'
import { getExportableFields } from '../config/signsImportExport'
import { useToast } from 'primevue/usetoast'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const toast = useToast()
const { isExporting, isImporting, exportToCSV, importFromCSV } = useSignsImportExport()

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const importResult = ref<TImportExport.ImportResult | null>(null)

const columnsList = computed(() => {
  return getExportableFields()
    .map(field => field.key)
    .join(', ')
})

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
  importResult.value = null
}

const handleExportCSV = async () => {
  try {
    await exportToCSV()
    toast.add({
      severity: 'success',
      summary: 'Export réussi',
      detail: 'Le fichier CSV a été téléchargé',
      life: 3000,
    })
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: "Erreur d'export",
      detail: error.message || 'Une erreur est survenue',
      life: 5000,
    })
  }
}

const handleImport = async () => {
  if (!selectedFile.value) return

  try {
    if (!selectedFile.value.name.endsWith('.csv')) {
      toast.add({
        severity: 'error',
        summary: 'Format invalide',
        detail: 'Le fichier doit être au format CSV',
        life: 5000,
      })
      return
    }

    const result = await importFromCSV(selectedFile.value)
    importResult.value = result

    const detailSummary = `${result.processed} traité(s) — ${result.created} nouveau(x), ${result.updated} mis à jour, ${result.unchanged} inchangé(s)`

    if (result.errors.length === 0) {
      toast.add({
        severity: 'success',
        summary: 'Import terminé',
        detail: detailSummary,
        life: 5000,
      })
      emit('saved')
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Import partiel',
        detail: `${detailSummary} — ${result.errors.length} erreur(s)`,
        life: 6000,
      })
    }

    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    selectedFile.value = null
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: "Erreur d'import",
      detail: error.message || 'Une erreur est survenue',
      life: 5000,
    })
  }
}
</script>
