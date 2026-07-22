<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
      <span class="i-fa6-solid-hand"></span>
      Configurations de main
    </h2>
    <div class="card mt-4">
      <div class="flex justify-end mb-2">
        <Button label="Ajouter" icon="i-fa-solid-plus" size="small" @click="openAddModal" />
      </div>
      <DataTable :value="handConfigurations" tableStyle="min-width: 40rem">
        <Column field="name" header="Nom"></Column>
        <Column header="Illustration">
          <template #body="slotProps">
            <img
              v-if="slotProps.data.illustration"
              :src="getIllustrationUrl(slotProps.data.illustration, slotProps.data.id)"
              alt="illustration"
              class="w-16 h-16 object-contain rounded"
            />
          </template>
        </Column>
        <!-- Actions column -->
        <Column header="Actions" style="width: 80px;">
          <template #body="slotProps">
            <div class="flex gap-2">
              <button
                class="btn btn-xs btn-ghost"
                title="Modifier"
                @click="editHandConfig(slotProps.data)"
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
      </DataTable>
    </div>
    <HandConfigurationModal
      v-model="showConfigModal"
      :configuration-id="editedConfigId"
      @saved="loadHandConfigurations"
    />
    <!-- Modal de confirmation suppression -->
    <ConfirmModal
      v-model="showDeleteModal"
      title="Supprimer la configuration ?"
      :message="deleteMessage"
      @confirm="deleteHandConfigConfirmed"
    />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import useHandConfigurations from '../composables/useHandConfigurations';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import HandConfigurationModal from '../components/HandConfigurationModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import config from '../../config';

const { handConfigurations, loadHandConfigurations, deleteHandConfiguration } = useHandConfigurations();
const showConfigModal = ref(false);
const editedConfigId = ref<string | undefined>(undefined);
const showDeleteModal = ref(false);
const handConfigToDelete = ref<any>(null);
const deleteMessage = ref('');

const getIllustrationUrl = (filename: string, id: string) => {
    // Remplacez ceci par la logique réelle pour générer l'URL de l'image
    // Par exemple, si PocketBase: `/api/files/hand_configurations/${id}/${filename}`
    return filename ? `${config.apiBaseUrl}/api/files/hand_configurations/${id}/${filename}` : '';
};

onMounted(loadHandConfigurations);

const openAddModal = () => {
    editedConfigId.value = undefined;
    showConfigModal.value = true;
};

const editHandConfig = (config: any) => {
    editedConfigId.value = config.id;
    showConfigModal.value = true;
};

const confirmDelete = (config: any) => {
    handConfigToDelete.value = config;
    deleteMessage.value = `Voulez-vous vraiment supprimer la configuration "${config.name}" ? Cette action est irréversible.`;
    showDeleteModal.value = true;
};

const deleteHandConfigConfirmed = async () => {
    if (handConfigToDelete.value) {
        // Remplacez par la logique réelle de suppression
        await deleteHandConfiguration(handConfigToDelete.value.id);
        await loadHandConfigurations();
        showDeleteModal.value = false;
        handConfigToDelete.value = null;
    }
};
</script>
