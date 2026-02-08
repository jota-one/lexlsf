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
        <Button
          label="Ajouter un signe"
          icon="i-fa-solid-plus"
          size="small"
          @click="openAddModal"
        />
      </div>
      <DataTable :value="signs" sortField="updated" :sortOrder="-1" tableStyle="min-width: 50rem">
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
        <template #footer> Nombre total de signes: {{ signs ? signs.length : 0 }}. </template>
      </DataTable>
    </div>
    <SignAddModal v-model="showAddModal" @saved="loadSigns" />
    <SignEditModal
      v-if="editedSign?.id"
      v-model="showEditModal"
      :sign-id="editedSign?.id"
      @saved="loadSigns"
    />
    <SignsImportExportModal v-model="showImportExportModal" @saved="loadSigns" />
    <ConfirmModal
      v-model="showDeleteModal"
      title="Supprimer le signe ?"
      :message="deleteMessage"
      @confirm="deleteSignConfirmed"
    />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import useSigns from '../composables/useSigns';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Rating from 'primevue/rating';
import Button from 'primevue/button'
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

const { signs, loadSigns, deleteSign, getNumericLevel } = useSigns();
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
    await loadSigns();
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
