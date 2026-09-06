<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center gap-2">
      <span class="text-sm text-base-content/60">
        {{ terms.length }} terme{{ terms.length > 1 ? 's' : '' }}
      </span>
      <div class="flex gap-2">
        <button type="button" class="btn btn-sm btn-outline" @click="showImportExport = true">
          <span class="i-fa-solid-file-csv"></span>
          Import / Export
        </button>
        <button type="button" class="btn btn-sm btn-primary" @click="startCreate">
          <span class="i-fa-solid-plus"></span>
          Ajouter un terme
        </button>
      </div>
    </div>

    <!-- Nouveau terme -->
    <div v-if="newTerm" class="p-4 border border-primary rounded-lg space-y-4">
      <h4 class="font-semibold text-sm">Nouveau terme</h4>
      <LexicalTermForm v-model="newTerm" :types="termTypes" :all-terms="allTerms" />
      <div class="flex justify-end gap-2">
        <button type="button" class="btn btn-ghost btn-sm" @click="newTerm = null">Annuler</button>
        <button type="button" class="btn btn-primary btn-sm" :disabled="saving" @click="createTerm">
          <span v-if="saving" class="loading loading-spinner loading-xs"></span>
          Ajouter
        </button>
      </div>
    </div>

    <DataTable
      v-model:expandedRows="expandedRows"
      :value="terms"
      dataKey="id"
      :loading="loading"
      tableStyle="min-width: 40rem"
      @rowExpand="onRowExpand"
    >
      <Column expander style="width: 3rem" />
      <Column field="term" header="Terme" sortable />
      <Column header="Type">
        <template #body="{ data }">
          <span v-if="data.expand?.Type" class="badge badge-sm">{{ data.expand.Type.tag }}</span>
          <span v-else class="text-base-content/30">—</span>
        </template>
      </Column>
      <Column header="Stratégie">
        <template #body="{ data }">
          <span v-if="data.strategy" class="text-sm text-base-content/70">
            {{ truncate(data.strategy) }}
          </span>
          <span v-else class="text-base-content/30">—</span>
        </template>
      </Column>
      <Column header="Note" style="width: 5rem">
        <template #body="{ data }">
          <span v-if="data.note" class="i-fa-solid-sticky-note text-base-content/50"></span>
          <span v-else class="text-base-content/30">—</span>
        </template>
      </Column>
      <Column header="Signe" style="width: 5rem">
        <template #body="{ data }">
          <span v-if="data.expand?.Sign" class="i-ic-round-sign-language text-info"></span>
          <span v-else class="text-base-content/30">—</span>
        </template>
      </Column>
      <Column header="Liens" style="width: 5rem">
        <template #body="{ data }">
          <span v-if="data.RelatedTerms?.length" class="badge badge-sm badge-ghost">
            {{ data.RelatedTerms.length }}
          </span>
          <span v-else class="text-base-content/30">—</span>
        </template>
      </Column>
      <Column header="Actions" style="width: 80px">
        <template #body="{ data }">
          <button
            type="button"
            class="btn btn-xs btn-ghost"
            title="Supprimer"
            @click="confirmDelete(data)"
          >
            <span class="i-fa-solid-trash"></span>
          </button>
        </template>
      </Column>

      <template #expansion="{ data }">
        <div v-if="buffers[data.id]" class="p-4 space-y-4 bg-base-200/40">
          <LexicalTermForm
            v-model="buffers[data.id]"
            :types="termTypes"
            :all-terms="allTerms"
            :current-id="data.id"
          />
          <div class="flex justify-end gap-2">
            <button type="button" class="btn btn-ghost btn-sm" @click="collapse(data.id)">
              Annuler
            </button>
            <button
              type="button"
              class="btn btn-primary btn-sm"
              :disabled="saving"
              @click="saveTerm(data.id)"
            >
              <span v-if="saving" class="loading loading-spinner loading-xs"></span>
              Enregistrer
            </button>
          </div>
        </div>
      </template>

      <template #empty>
        <p class="text-center text-base-content/50 py-8">Aucun terme dans ce champ lexical.</p>
      </template>
    </DataTable>

    <ConfirmModal
      v-model="showDeleteModal"
      title="Supprimer le terme ?"
      :message="deleteMessage"
      @confirm="deleteConfirmed"
    />

    <LexicalTermsImportExportModal
      v-model="showImportExport"
      :field-id="fieldId"
      @imported="reload"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import useLexicalTerms from '../composables/useLexicalTerms'
import useTermTypes from '../composables/useTermTypes'
import usePbErrorToast from '../composables/usePbErrorToast'
import LexicalTermForm from './LexicalTermForm.vue'
import LexicalTermsImportExportModal from './LexicalTermsImportExportModal.vue'
import ConfirmModal from './ConfirmModal.vue'
import type { TLexicalTerm } from '../../types'

type Props = {
  fieldId: string
}
const props = defineProps<Props>()

const { terms, loadTermsByField, loadAllTerms, addTerm, updateTerm, deleteTerm } = useLexicalTerms()
const { termTypes, loadTermTypes } = useTermTypes()
const { showPbError } = usePbErrorToast()

const loading = ref(false)
const saving = ref(false)
const expandedRows = ref<Record<string, boolean>>({})
const buffers = ref<Record<string, TLexicalTerm.TForm>>({})
const newTerm = ref<TLexicalTerm.TForm | null>(null)
const allTerms = ref<TLexicalTerm.TRecord[]>([])

const showDeleteModal = ref(false)
const showImportExport = ref(false)
const termToDelete = ref<TLexicalTerm.TRecord | null>(null)
const deleteMessage = ref('')

const truncate = (value: string) => (value.length > 60 ? `${value.slice(0, 60)}…` : value)

const emptyForm = (): TLexicalTerm.TForm => ({
  term: '',
  LexicalField: props.fieldId,
  Sign: '',
  Type: '',
  note: '',
  strategy: '',
  RelatedTerms: [],
})

const toForm = (record: TLexicalTerm.TRecord): TLexicalTerm.TForm => ({
  id: record.id,
  term: record.term,
  LexicalField: props.fieldId,
  Sign: record.Sign || '',
  Type: record.Type || '',
  note: record.note || '',
  strategy: record.strategy || '',
  RelatedTerms: [...(record.RelatedTerms || [])],
})

const reload = async () => {
  loading.value = true
  try {
    await loadTermsByField(props.fieldId)
    allTerms.value = await loadAllTerms()
  } catch (error) {
    showPbError(error)
  } finally {
    loading.value = false
  }
}

const onRowExpand = ({ data }: { data: TLexicalTerm.TRecord }) => {
  buffers.value[data.id] = toForm(data)
}

const collapse = (id: string) => {
  const next = { ...expandedRows.value }
  delete next[id]
  expandedRows.value = next
  delete buffers.value[id]
}

const startCreate = () => {
  newTerm.value = emptyForm()
}

const createTerm = async () => {
  if (!newTerm.value?.term.trim()) {
    return
  }
  saving.value = true
  try {
    await addTerm(newTerm.value)
    newTerm.value = null
    await reload()
  } catch (error) {
    showPbError(error)
  } finally {
    saving.value = false
  }
}

const saveTerm = async (id: string) => {
  const payload = buffers.value[id]
  if (!payload?.term.trim()) {
    return
  }
  saving.value = true
  try {
    await updateTerm(id, payload)
    collapse(id)
    await reload()
  } catch (error) {
    showPbError(error)
  } finally {
    saving.value = false
  }
}

const confirmDelete = (record: TLexicalTerm.TRecord) => {
  termToDelete.value = record
  deleteMessage.value = `Voulez-vous vraiment supprimer le terme "${record.term}" ?`
  showDeleteModal.value = true
}

const deleteConfirmed = async () => {
  if (!termToDelete.value) {
    return
  }
  try {
    await deleteTerm(termToDelete.value.id)
    showDeleteModal.value = false
    await reload()
  } catch (error) {
    showPbError(error)
  }
}

onMounted(async () => {
  await reload()
  await loadTermTypes()
})
</script>
