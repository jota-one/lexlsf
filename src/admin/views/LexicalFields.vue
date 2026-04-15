<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
      <span class="i-fa6-solid-book-open"></span>
      Champs lexicaux
    </h2>
    <div class="card">
      <div class="flex justify-end mb-2">
        <Button label="Ajouter un champ lexical" icon="i-fa-solid-plus" size="small" @click="showAddModal = true" />
      </div>
      <DataTable :value="lexicalFields" sortField="name" :sortOrder="1" tableStyle="min-width: 40rem">
        <Column field="name" header="Nom" sortable />
        <Column header="Termes">
          <template #body="slotProps">
            {{ slotProps.data._termCount ?? '—' }}
          </template>
        </Column>
        <Column field="Roles" header="Rôles">
          <template #body="slotProps">
            {{ roleNames(slotProps.data.expand?.Roles) }}
          </template>
        </Column>
        <Column field="updated" header="Dernière modif" sortable>
          <template #body="slotProps">{{ formatDate(slotProps.data.updated) }}</template>
        </Column>
        <Column header="Actions" style="width: 80px;">
          <template #body="slotProps">
            <div class="flex gap-2">
              <button class="btn btn-xs btn-ghost" title="Modifier" @click="editField(slotProps.data)">
                <span class="i-fa-solid-pen"></span>
              </button>
              <button class="btn btn-xs btn-ghost" title="Supprimer" @click="confirmDelete(slotProps.data)">
                <span class="i-fa-solid-trash"></span>
              </button>
            </div>
          </template>
        </Column>
        <template #footer>Total : {{ lexicalFields.length }}</template>
      </DataTable>
    </div>

    <LexicalFieldAddModal v-model="showAddModal" @saved="load" />
    <LexicalFieldEditModal
      v-if="editedField?.id"
      v-model="showEditModal"
      :field-id="editedField.id"
      @saved="load"
    />
    <ConfirmModal
      v-model="showDeleteModal"
      title="Supprimer le champ lexical ?"
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
import useLexicalFields from '../composables/useLexicalFields'
import LexicalFieldAddModal from '../components/LexicalFieldAddModal.vue'
import LexicalFieldEditModal from '../components/LexicalFieldEditModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const { lexicalFields, loadLexicalFields, deleteLexicalField } = useLexicalFields()
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editedField = ref<any>(null)
const fieldToDelete = ref<any>(null)
const deleteMessage = ref('')

const roleNames = (roles: any[]) => roles?.length ? roles.map(r => r.name).join(', ') : '—'
const formatDate = (d: string) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : ''

const editField = (field: any) => { editedField.value = field; showEditModal.value = true }
const confirmDelete = (field: any) => {
  fieldToDelete.value = field
  deleteMessage.value = `Voulez-vous vraiment supprimer "${field.name}" et tous ses termes ?`
  showDeleteModal.value = true
}
const deleteConfirmed = async () => {
  if (fieldToDelete.value) {
    await deleteLexicalField(fieldToDelete.value.id)
    await load()
    showDeleteModal.value = false
  }
}

const load = () => loadLexicalFields()
onMounted(load)
</script>
