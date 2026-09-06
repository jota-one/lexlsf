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
        <span class="i-fa-solid-file-csv text-xl"></span>
        <span class="font-bold">Import / Export des termes</span>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Export -->
      <div class="card bg-base-200 p-4">
        <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <span class="i-fa-solid-file-export"></span>
          Export
        </h3>
        <p class="text-sm mb-4">Exporter les termes de ce champ lexical dans un fichier CSV.</p>
        <Button
          label="Exporter en CSV"
          icon="i-fa-solid-file-csv"
          @click="handleExportCSV"
          :loading="isExporting"
          :disabled="isExporting || isImporting"
          severity="secondary"
        />
      </div>

      <!-- Import -->
      <div class="card bg-base-200 p-4">
        <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <span class="i-fa-solid-file-import"></span>
          Import
        </h3>
        <p class="text-sm mb-4">
          Importer des termes dans ce champ lexical. Les termes existants (par ID) sont mis à jour,
          les nouveaux sont créés.
        </p>

        <div class="mb-4">
          <input
            ref="fileInput"
            type="file"
            accept=".csv"
            @change="handleFileSelect"
            class="file-input file-input-bordered w-full"
          />
        </div>

        <Button
          label="Importer le fichier"
          icon="i-fa-solid-upload"
          @click="handleImport"
          :loading="isImporting"
          :disabled="!selectedFile || isExporting || isImporting"
          severity="primary"
        />
      </div>

      <!-- Résultats -->
      <div v-if="importResult" class="card bg-base-200 p-4">
        <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
          <span class="i-fa-solid-clipboard-check"></span>
          Résultats de l'import
        </h3>

        <div class="alert alert-info mb-3">
          <span class="i-fa6-solid-list-check"></span>
          <span>
            {{ importResult.processed }} terme(s) traité(s) — {{ importResult.created }} nouveau(x),
            {{ importResult.updated }} mis à jour, {{ importResult.unchanged }} inchangé(s)
          </span>
        </div>

        <div
          v-if="importResult.success > 0 && importResult.errors.length === 0"
          class="alert alert-success mb-3"
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
                <tr v-for="(error, index) in importResult.errors" :key="`error-${index}`">
                  <td>{{ error.line || '—' }}</td>
                  <td>{{ error.name }}</td>
                  <td class="text-error">{{ error.error }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Aide -->
      <div class="card bg-base-100 p-4 border border-base-300">
        <h3 class="text-sm font-semibold mb-2 flex items-center gap-2">
          <span class="i-fa-solid-info-circle"></span>
          Format du fichier
        </h3>
        <div class="text-xs space-y-2">
          <p>
            <strong>CSV :</strong> les colonnes attendues sont : {{ columnsList }}. Les colonnes
            peuvent être séparées par des virgules ou des points-virgules.
          </p>
          <p>
            <strong>Type :</strong> le nom de la catégorie, qui doit exister et être taggée
            <code>lexical_term</code>. Exemple : <code>Institution</code>.
          </p>
          <p>
            <strong>related :</strong> les noms des termes liés séparés par des virgules. Exemple :
            <code>Ministre,Parlement</code>. Les liens sont réciproques et peuvent pointer vers des
            termes d'autres champs lexicaux. Ils sont résolus après la création de tous les termes
            du fichier, et sont uniquement ajoutés — jamais supprimés.
          </p>
          <p class="text-warning">
            <strong>Note :</strong> le signe associé n'est pas importable. Il se renseigne depuis la
            liste des termes.
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
import { computed, ref, useTemplateRef } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import useLexicalTermsImportExport from '../composables/useLexicalTermsImportExport'
import { getExportableFields } from '../config/lexicalTermsImportExport'
import type { TImportExport } from '../types'

type Props = {
  modelValue: boolean
  fieldId: string
}
const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  imported: []
}>()

const toast = useToast()
const { isExporting, isImporting, exportToCSV, importFromCSV } = useLexicalTermsImportExport(
  props.fieldId,
)

const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const selectedFile = ref<File | null>(null)
const importResult = ref<TImportExport.ImportResult | null>(null)

const columnsList = computed(() =>
  getExportableFields()
    .map(field => field.key)
    .join(', '),
)

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
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: "Erreur d'export",
      detail: (error as Error).message || 'Une erreur est survenue',
      life: 5000,
    })
  }
}

const handleImport = async () => {
  if (!selectedFile.value) {
    return
  }
  if (!selectedFile.value.name.endsWith('.csv')) {
    toast.add({
      severity: 'error',
      summary: 'Format invalide',
      detail: 'Le fichier doit être au format CSV',
      life: 5000,
    })
    return
  }

  try {
    importResult.value = await importFromCSV(selectedFile.value)
    emit('imported')
    selectedFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: "Erreur d'import",
      detail: (error as Error).message || 'Une erreur est survenue',
      life: 5000,
    })
  }
}
</script>
