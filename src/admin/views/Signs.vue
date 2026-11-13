<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
      <span class="i-fa-solid-hands"></span>
      Signes
    </h2>
    <div class="card">
      <div class="flex flex-wrap justify-between gap-2 mb-2">
        <Button
          label="Import / Export"
          icon="i-fa-solid-file-import-export"
          size="small"
          severity="secondary"
          @click="openImportExportModal"
        />
        <div class="flex flex-wrap items-center gap-2">
          <SelectButton
            v-model="videoFilter"
            :options="videoFilterOptions"
            option-label="label"
            option-value="value"
            :allow-empty="false"
            size="small"
            aria-label="Filtrer par vidéo"
          />
          <InputText
            v-model="searchQuery"
            placeholder="Rechercher (nom, catégorie…)"
            size="small"
            class="w-64"
          />
          <Button
            label="Ajouter un signe"
            icon="i-fa-solid-plus"
            size="small"
            @click="openAddModal"
          />
        </div>
      </div>
      <div class="text-sm text-base-content/60 mb-2">{{ summary }}</div>
      <DataTable
        :value="signs"
        :sortField="sortField"
        :sortOrder="sortOrder"
        :lazy="true"
        paginator
        :rows="perPage"
        :first="(page - 1) * perPage"
        :totalRecords="totalSigns"
        :rowsPerPageOptions="[25, 50, 100]"
        @sort="onSort"
        @page="onPage"
        tableStyle="min-width: 50rem"
      >
        <Column style="width: 40px" :header="''">
          <template #body="slotProps">
            <template v-if="getSignProblems(slotProps.data).length">
              <button
                class="btn btn-xs btn-ghost"
                v-tooltip="getSignProblems(slotProps.data).join('\n')"
              >
                <span
                  class="i-fa6-solid-triangle-exclamation text-warning text-lg cursor-pointer"
                ></span>
              </button>
            </template>
          </template>
        </Column>
        <Column field="name" header="Terme" sortable>
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <button
                class="btn btn-xs btn-ghost"
                title="Modifier"
                @click="editSign(slotProps.data)"
              >
                <span class="i-fa-solid-pen"></span>
              </button>
              <span>{{ slotProps.data.name }}</span>
            </div>
          </template>
        </Column>
        <Column field="category" header="Catégorie(s)">
          <template #body="slotProps">
            {{ categories(slotProps.data.expand?.Category) }}
          </template>
        </Column>
        <Column field="level" header="Niveau">
          <template #body="slotProps">
            <Rating :modelValue="getNumericLevel(slotProps.data.level)" readonly />
          </template>
        </Column>
        <Column field="primary_language" header="Langue">
          <template #body="slotProps">
            {{ getPrimaryLanguageLabel(slotProps.data.primary_language) }}
          </template>
        </Column>
        <Column field="learning_source" header="Source">
          <template #body="slotProps">
            <span v-tooltip="slotProps.data.learning_source_detail || undefined">
              {{ getLearningSourceLabel(slotProps.data.learning_source) }}
            </span>
          </template>
        </Column>
        <Column field="Roles" header="Roles">
          <template #body="slotProps">
            {{ roleNames(slotProps.data.expand?.Roles) }}
          </template>
        </Column>
        <!-- Dernière modif -->
        <Column field="updated" header="Dernière modif" sortable>
          <template #body="slotProps">
            <span>{{ formatDate(slotProps.data.updated) }}</span>
          </template>
        </Column>
        <Column style="width: 50px">
          <template #body="slotProps">
            <button
              class="btn btn-xs btn-ghost"
              title="Supprimer"
              @click="confirmDelete(slotProps.data)"
            >
              <span class="i-fa-solid-trash"></span>
            </button>
          </template>
        </Column>
      </DataTable>
    </div>
    <SignModal v-model="showSignModal" :sign-id="editedSignId" @saved="reload" />
    <SignsImportExportModal v-model="showImportExportModal" @saved="reload" />
    <ConfirmModal
      v-model="showDeleteModal"
      title="Supprimer le signe ?"
      :message="deleteMessage"
      @confirm="deleteSignConfirmed"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'
import dayjs from 'dayjs'
import useSigns, { SIGNS_PER_PAGE, type SignVideoFilter } from '../composables/useSigns'
import DataTable, { type DataTablePageEvent, type DataTableSortEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Rating from 'primevue/rating'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import SelectButton from 'primevue/selectbutton'
import SignModal from '../components/SignModal.vue'
import SignsImportExportModal from '../components/SignsImportExportModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import type { TSign } from '../../types'

// Retourne la liste des problèmes pour un signe
function getSignProblems(sign: TSign.TRecord): string[] {
  const problems: string[] = []
  // Absence de fichier vidéo
  if (!sign.video) {
    problems.push('Absence de fichier vidéo')
  }
  // Prévoir d’autres checks ici
  return problems
}

const {
  signs,
  totalSigns,
  loadSigns,
  deleteSign,
  getNumericLevel,
  learningSourceOptions,
  primaryLanguageOptions,
} = useSigns()

const searchQuery = ref('')
const debouncedQuery = refDebounced(searchQuery, 350)
const sortField = ref('updated')
const sortOrder = ref<1 | -1>(-1)
const page = ref(1)
const perPage = ref(SIGNS_PER_PAGE)
const videoFilter = ref<SignVideoFilter>('all')

const videoFilterOptions: Array<{ label: string; value: SignVideoFilter }> = [
  { label: 'Tous', value: 'all' },
  { label: 'Avec vidéo', value: 'with' },
  { label: 'Sans vidéo', value: 'without' },
]

const reload = () =>
  loadSigns({
    search: debouncedQuery.value,
    video: videoFilter.value,
    sort: `${sortOrder.value === -1 ? '-' : ''}${sortField.value}`,
    page: page.value,
    perPage: perPage.value,
  })

const onSort = (event: DataTableSortEvent) => {
  if (typeof event.sortField === 'string') {
    sortField.value = event.sortField
  }
  sortOrder.value = event.sortOrder === -1 ? -1 : 1
  page.value = 1
  reload()
}

const onPage = (event: DataTablePageEvent) => {
  page.value = event.page + 1
  perPage.value = event.rows
  reload()
}

// A new search or filter starts again from the first page.
watch([debouncedQuery, videoFilter], () => {
  page.value = 1
  reload()
})

const summary = computed(() => {
  const count = `${totalSigns.value} signe${totalSigns.value > 1 ? 's' : ''}`
  return debouncedQuery.value.trim() ? `${count} pour « ${debouncedQuery.value.trim()} »` : count
})

const getPrimaryLanguageLabel = (value: string) =>
  primaryLanguageOptions.find(o => o.value === value)?.label ?? value ?? ''

const getLearningSourceLabel = (value: string) =>
  learningSourceOptions.find(o => o.value === value)?.label ?? value ?? ''
const showSignModal = ref(false)
const editedSignId = ref<string | undefined>(undefined)
const showImportExportModal = ref(false)

const showDeleteModal = ref(false)
const signToDelete = ref<TSign.TRecord | null>(null)
const deleteMessage = ref('')

const categories = (category: Array<{ tag: string }>) => {
  return (category || []).map(c => c.tag).join(', ')
}

const roleNames = (roles: Array<{ name: string }>) => {
  if (!roles?.length) {
    return '-'
  }
  return roles.map(r => r.name).join(', ')
}

const openAddModal = () => {
  editedSignId.value = undefined
  showSignModal.value = true
}

const openImportExportModal = () => {
  showImportExportModal.value = true
}

const editSign = (sign: TSign.TRecord) => {
  editedSignId.value = sign.id
  showSignModal.value = true
}

const confirmDelete = (sign: TSign.TRecord) => {
  signToDelete.value = sign
  deleteMessage.value = `Voulez-vous vraiment supprimer le signe "${sign.name}" ? Cette action est irréversible.`
  showDeleteModal.value = true
}

const deleteSignConfirmed = async () => {
  if (signToDelete.value) {
    await deleteSign(signToDelete.value.id)
    await reload()
    showDeleteModal.value = false
    signToDelete.value = null
  }
}

const formatDate = (date: string) => {
  if (!date) {
    return ''
  }
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

onMounted(reload)
</script>
