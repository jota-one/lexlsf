<template>
    <div class="p-8">
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
            <span class="i-fa-solid-hand"></span>
            Configurations de main
        </h2>
        <p>Liste des configurations de main.</p>
        <div class="card mt-4">
            <div class="flex justify-end mb-2">
                <Button label="Ajouter" icon="i-fa-solid-plus" size="small" @click="showAddModal = true" />
            </div>
            <DataTable :value="handConfigurations" tableStyle="min-width: 40rem">
                <Column field="name" header="Nom"></Column>
                <Column header="Illustration">
                    <template #body="slotProps">
                        <img v-if="slotProps.data.illustration"
                            :src="getIllustrationUrl(slotProps.data.illustration, slotProps.data.id)" alt="illustration"
                            class="w-16 h-16 object-contain rounded" />
                    </template>
                </Column>
            </DataTable>
        </div>
        <HandConfigurationModal v-model="showAddModal" @saved="loadHandConfigurations" />
    </div>
</template>
<script setup lang="ts">
// filepath: /Users/joelpoulin/Sites/astro/lexlsf/src/admin/views/HandConfigurations.vue
import { onMounted, ref } from 'vue';
import useHandConfigurations from '../composables/useHandConfigurations';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import HandConfigurationModal from '../components/HandConfigurationModal.vue';
import config from '../../config';

const { handConfigurations, loadHandConfigurations } = useHandConfigurations();
const showAddModal = ref(false);

const getIllustrationUrl = (filename: string, id: string) => {
    // Remplacez ceci par la logique réelle pour générer l'URL de l'image
    // Par exemple, si PocketBase: `/api/files/hand_configurations/${id}/${filename}`
    return filename ? `${config.apiBaseUrl}/api/files/hand_configurations/${id}/${filename}` : '';
};

onMounted(loadHandConfigurations);
</script>