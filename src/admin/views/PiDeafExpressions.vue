<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
      <span class="i-fa6-solid-hands"></span>
      Expressions pi-sourdes
    </h2>
    <div class="card">
      <div class="flex justify-end mb-2">
        <Button label="Ajouter une expression" icon="i-fa-solid-plus" size="small" @click="openAddModal" />
      </div>
      <DataTable :value="piDeafExpressions" sortField="name" :sortOrder="1" tableStyle="min-width: 40rem">
        <Column field="name" header="Nom" sortable />
        <Column header="Signe associé">
          <template #body="slotProps">
            {{ slotProps.data.expand?.Sign?.name ?? '—' }}
          </template>
        </Column>
        <Column field="Roles" header="Rôles">
          <template #body="slotProps">{{ roleNames(slotProps.data.expand?.Roles) }}</template>
        </Column>
        <Column field="updated" header="Dernière modif" sortable>
          <template #body="slotProps">{{ formatDate(slotProps.data.updated) }}</template>
        </Column>
        <Column header="Actions" style="width: 80px;">
          <template #body="slotProps">
            <div class="flex gap-2">
              <button class="btn btn-xs btn-ghost" title="Modifier" @click="editExpression(slotProps.data)">
                <span class="i-fa-solid-pen"></span>
              </button>
              <button class="btn btn-xs btn-ghost" title="Supprimer" @click="confirmDelete(slotProps.data)">
                <span class="i-fa-solid-trash"></span>
              </button>
            </div>
          </template>
        </Column>
        <template #footer>Total : {{ piDeafExpressions.length }}</template>
      </DataTable>
    </div>

    <PiDeafExpressionModal v-model="showExpressionModal" :expression-id="editedExpressionId" @saved="load" />
    <ConfirmModal
      v-model="showDeleteModal"
      title="Supprimer l'expression pi-sourde ?"
      :message="deleteMessage"
      @confirm="deleteConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import usePiDeafExpressions from '../composables/usePiDeafExpressions'
import PiDeafExpressionModal from '../components/PiDeafExpressionModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const { piDeafExpressions, loadPiDeafExpressions, deletePiDeafExpression } = usePiDeafExpressions()
const showExpressionModal = ref(false)
const editedExpressionId = ref<string | undefined>(undefined)
const showDeleteModal = ref(false)
const expressionToDelete = ref<{ id: string } | null>(null)
const deleteMessage = ref('')

const roleNames = (roles: Array<{ name: string }>) => roles?.length ? roles.map(r => r.name).join(', ') : '—'
const formatDate = (d: string) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : ''

const openAddModal = () => { editedExpressionId.value = undefined; showExpressionModal.value = true }
const editExpression = (expr: { id: string }) => { editedExpressionId.value = expr.id; showExpressionModal.value = true }
const confirmDelete = (expr: { id: string; name?: string }) => {
  expressionToDelete.value = expr
  deleteMessage.value = `Voulez-vous vraiment supprimer "${expr.name || 'cette expression'}" ?`
  showDeleteModal.value = true
}
const deleteConfirmed = async () => {
  if (expressionToDelete.value) {
    await deletePiDeafExpression(expressionToDelete.value.id)
    await load()
    showDeleteModal.value = false
  }
}

const load = () => loadPiDeafExpressions()
onMounted(load)
</script>
