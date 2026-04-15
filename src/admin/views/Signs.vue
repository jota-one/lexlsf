<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
      <span class="i-fa-solid-hands"></span>
      Signes
    </h2>
    <div class="card">
      <div class="flex justify-between mb-2">
        <Button
          label="Import / Export"
          icon="i-fa-solid-file-import-export"
          size="small"
          severity="secondary"
          @click="openImportExportModal"
        />
        <div class="flex items-center gap-2">
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
      <div class="text-sm text-base-content/60 mb-2">
        <span v-if="debouncedQuery">{{ signs.length }} résultat(s) pour « {{ debouncedQuery }} »</span>
        <span v-else>{{ signs.length }} signes chargés sur un total de {{ totalSigns }}</span>
      </div>
      <DataTable
        :value="signs"
        :sortField="sortField"
        :sortOrder="sortOrder"
        :lazy="true"
        @sort="onSort"
        tableStyle="min-width: 50rem"
      >
        <Column style="width: 40px;" :header="''">
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
        <Column field="name" header="Terme" sortable></Column>
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
        <Column header="Actions" style="width: 80px;">
          <template #body="slotProps">
            <div class="flex gap-2">
              <button
                class="btn btn-xs btn-ghost"
                title="Modifier"
                @click="editSign(slotProps.data)"
              >
                <span class="i-fa-solid-pen"></span>
              </button>
              <button
                class="btn btn-xs btn-ghost"
                title="Supprimer"
                @click="confirmDelete(slotProps.data)"
              >
                <span class="i-fa-solid-trash"></span>
              </button>
            </div>
          </template>
        </Column>
        <template #footer>
          <span v-if="debouncedQuery">{{ signs.length }} résultat(s) pour « {{ debouncedQuery }} »</span>
          <span v-else>{{ signs.length }} signes chargés sur un total de {{ totalSigns }}</span>
        </template>
      </DataTable>
    </div>
    <SignAddModal v-model="showAddModal" @saved="reload" />
    <SignEditModal
      v-if="editedSign?.id"
      v-model="showEditModal"
      :sign-id="editedSign?.id"
      @saved="reload"
    />
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
import { onMounted, ref, watch } from 'vue';
import { refDebounced } from '@vueuse/core';
import dayjs from 'dayjs';
import useSigns from '../composables/useSigns';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Rating from 'primevue/rating';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import SignAddModal from '../components/SignAddModal.vue';
import SignEditModal from '../components/SignEditModal.vue';
import SignsImportExportModal from '../components/SignsImportExportModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import type { TSign } from '../../types';

// Retourne la liste des problèmes pour un signe
function getSignProblems(sign: TSign.TRecord): string[] {
  const problems: string[] = [];
  // Absence de fichier vidéo
  if (!sign.video) {
    problems.push('Absence de fichier vidéo');
  }
  // Prévoir d’autres checks ici
  return problems;
}

const { signs, totalSigns, loadSigns, deleteSign, getNumericLevel, learningSourceOptions, primaryLanguageOptions } = useSigns();

const searchQuery = ref('')
const debouncedQuery = refDebounced(searchQuery, 350)
const sortField = ref('updated')
const sortOrder = ref<1 | -1>(-1)

const pbSort = () => `${sortOrder.value === -1 ? '-' : ''}${sortField.value}`

const onSort = (event: { sortField: string; sortOrder: 1 | -1 }) => {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder
  loadSigns(debouncedQuery.value, pbSort())
}

watch(debouncedQuery, q => loadSigns(q, pbSort()))

const reload = () => loadSigns(debouncedQuery.value, pbSort())

const getPrimaryLanguageLabel = (value: string) =>
  primaryLanguageOptions.find(o => o.value === value)?.label ?? value ?? ''

const getLearningSourceLabel = (value: string) =>
  learningSourceOptions.find(o => o.value === value)?.label ?? value ?? ''
const showAddModal = ref(false);
const showEditModal = ref(false);
const showImportExportModal = ref(false);

const showDeleteModal = ref(false);
const signToDelete = ref<any>(null);
const editedSign = ref<any>(null);
const deleteMessage = ref('');

const categories = (category: any[]) => {
  return (category || []).map(c => c.tag).join(', ')
};

const roleNames = (roles: any[]) => {
  if (!roles?.length) {
    return '-';
  }
  return roles.map(r => r.name).join(', ');
};

const openAddModal = () => {
  showAddModal.value = true;
};

const openImportExportModal = () => {
  showImportExportModal.value = true;
};

const editSign = (sign: any) => {
  editedSign.value = sign;
  showEditModal.value = true;
};

const confirmDelete = (sign: any) => {
  signToDelete.value = sign;
  deleteMessage.value = `Voulez-vous vraiment supprimer le signe "${sign.name}" ? Cette action est irréversible.`;
  showDeleteModal.value = true;
};

const deleteSignConfirmed = async () => {
  if (signToDelete.value) {
    await deleteSign(signToDelete.value.id);
    await reload();
    showDeleteModal.value = false;
    signToDelete.value = null;
  }
};

const formatDate = (date: string) => {
  if (!date) return '';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

onMounted(loadSigns)
</script>
