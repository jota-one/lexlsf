<template>
    <div class="p-8">
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
            <span class="i-fa-solid-arrows-up-down-left-right"></span>
            Mouvements de main
        </h2>
        <p>Liste des mouvements de main.</p>
        <div class="card mt-4">
            <div class="flex justify-end mb-2">
                <Button label="Ajouter" icon="i-fa-solid-plus" size="small" @click="showAddModal = true" />
            </div>
            <DataTable :value="handMovements" tableStyle="min-width: 40rem">
                <Column field="hand_type" header="Type"></Column>
                <Column field="direction" header="Direction"></Column>
            </DataTable>
        </div>
        <HandMovementModal v-model="showAddModal" />
    </div>
</template>
<script setup lang="ts">
// filepath: /Users/joelpoulin/Sites/astro/lexlsf/src/admin/views/HandMovements.vue
import { onMounted, ref } from 'vue';
import useHandMovements from '../composables/useHandMovements';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import HandMovementModal from '../components/HandMovementModal.vue';

const { handMovements, loadHandMovements } = useHandMovements();
const showAddModal = ref(false);

onMounted(loadHandMovements);
</script>
