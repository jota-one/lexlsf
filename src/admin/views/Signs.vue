<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
      <span class="i-fa-solid-hands"></span>
      Signes
    </h2>
    <p>Gestion des signes.</p>

    <div class="card">
      <div class="flex justify-end mb-2">
        <Button label="Ajouter un signe" icon="i-fa-solid-plus" size="small" @click="openAddModal" />
      </div>
      <DataTable :value="signs" tableStyle="min-width: 50rem">
        <Column field="name" header="Terme"></Column>
        <Column field="category" header="Catégorie(s)">
          <template #body="slotProps">
            {{ categories(slotProps.data.expand.Category) }}
          </template>
        </Column>
        <Column field="level" header="Niveau">
          <template #body="slotProps">
            <Rating :modelValue="numericLevel(slotProps.data.level)" readonly />
          </template>
        </Column>
        <Column header="Configuration">
          <template #body="slotProps">
            {{ slotProps.data.expand.ConfigurationRight?.name }}
            <span v-if="slotProps.data.expand.ConfigurationLeft"> / {{ slotProps.data.expand.ConfigurationLeft.name
            }}</span>
          </template>
        </Column>
        <template #footer> Nombre total de signes: {{ signs ? signs.length : 0 }}. </template>
      </DataTable>
    </div>
    <SignFormModal v-model="showAddModal" @saved="loadSigns" />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import useSigns from '../composables/useSigns';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Rating from 'primevue/rating';
import Button from 'primevue/button'
import SignFormModal from '../components/SignFormModal.vue';

const { signs, loadSigns } = useSigns();
const showAddModal = ref(false);


const numericLevel = (level: string) => {
  return ['a1', 'a2', 'b1', 'b2', 'c1'].indexOf(level) + 1
};

const categories = (category: any[]) => {
  return category.map(c => c.tag).join(', ')
};

const openAddModal = () => {
  showAddModal.value = true;

}

onMounted(loadSigns)
</script>