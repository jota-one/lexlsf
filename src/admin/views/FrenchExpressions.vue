<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
      <span class="i-fa6-solid-comment-dots"></span>
      Expressions françaises
    </h2>
    <div class="card">
      <div class="flex justify-end mb-2">
        <Button label="Ajouter une expression" icon="i-fa-solid-plus" size="small" @click="openAddModal" />
      </div>
      <DataTable :value="frenchExpressions" sortField="expression" :sortOrder="1" tableStyle="min-width: 40rem">
        <Column field="expression" header="Expression" sortable />
        <Column header="Signes liés">
          <template #body="slotProps">{{ slotProps.data.Signs?.length ?? 0 }}</template>
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
        <template #footer>Total : {{ frenchExpressions.length }}</template>
      </DataTable>
    </div>

    <FrenchExpressionModal v-model="showExpressionModal" :expression-id="editedExpressionId" @saved="load" />
    <ConfirmModal
      v-model="showDeleteModal"
      title="Supprimer l'expression ?"
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
import useFrenchExpressions from '../composables/useFrenchExpressions'
import FrenchExpressionModal from '../components/FrenchExpressionModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const { frenchExpressions, loadFrenchExpressions, deleteFrenchExpression } = useFrenchExpressions()
const showExpressionModal = ref(false)
const editedExpressionId = ref<string | undefined>(undefined)
const showDeleteModal = ref(false)
const expressionToDelete = ref<{ id: string } | null>(null)
const deleteMessage = ref('')

const roleNames = (roles: Array<{ name: string }>) => roles?.length ? roles.map(r => r.name).join(', ') : '—'
const formatDate = (d: string) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : ''

const openAddModal = () => { editedExpressionId.value = undefined; showExpressionModal.value = true }
const editExpression = (expr: { id: string }) => { editedExpressionId.value = expr.id; showExpressionModal.value = true }
const confirmDelete = (expr: { id: string; expression?: string }) => {
  expressionToDelete.value = expr
  deleteMessage.value = `Voulez-vous vraiment supprimer l'expression "${expr.expression}" ?`
  showDeleteModal.value = true
}
const deleteConfirmed = async () => {
  if (expressionToDelete.value) {
    await deleteFrenchExpression(expressionToDelete.value.id)
    await load()
    showDeleteModal.value = false
  }
}

const load = () => loadFrenchExpressions()
onMounted(load)
</script>
