<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
      <span class="i-fa6-solid-comment-dots"></span>
      Expressions françaises
    </h2>
    <div class="card">
      <div class="flex justify-end mb-2">
        <Button label="Ajouter une expression" icon="i-fa-solid-plus" size="small" @click="showAddModal = true" />
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

    <FrenchExpressionAddModal v-model="showAddModal" @saved="load" />
    <FrenchExpressionEditModal
      v-if="editedExpression?.id"
      v-model="showEditModal"
      :expression-id="editedExpression.id"
      @saved="load"
    />
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
import FrenchExpressionAddModal from '../components/FrenchExpressionAddModal.vue'
import FrenchExpressionEditModal from '../components/FrenchExpressionEditModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const { frenchExpressions, loadFrenchExpressions, deleteFrenchExpression } = useFrenchExpressions()
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editedExpression = ref<any>(null)
const expressionToDelete = ref<any>(null)
const deleteMessage = ref('')

const roleNames = (roles: any[]) => roles?.length ? roles.map(r => r.name).join(', ') : '—'
const formatDate = (d: string) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : ''

const editExpression = (expr: any) => { editedExpression.value = expr; showEditModal.value = true }
const confirmDelete = (expr: any) => {
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
