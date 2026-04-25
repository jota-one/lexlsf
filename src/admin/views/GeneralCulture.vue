<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
      <span class="i-fa6-solid-timeline text-xl"></span>
      Culture générale
    </h2>
    <div class="card">
      <div class="flex justify-end mb-2">
        <Button label="Ajouter un item" icon="i-fa-solid-plus" size="small" @click="showAddModal = true" />
      </div>
      <DataTable :value="items" sortField="start_date" :sortOrder="1" tableStyle="min-width: 40rem">
        <Column field="name" header="Nom" sortable />
        <Column header="Période / Date" sortable sort-field="start_date">
          <template #body="slotProps">
            <span v-if="slotProps.data.end_date">
              {{ slotProps.data.start_date }} → {{ slotProps.data.end_date }}
            </span>
            <span v-else>{{ slotProps.data.start_date }}</span>
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
              <button class="btn btn-xs btn-ghost" title="Modifier" @click="editItem(slotProps.data)">
                <span class="i-fa-solid-pen"></span>
              </button>
              <button class="btn btn-xs btn-ghost" title="Supprimer" @click="confirmDelete(slotProps.data)">
                <span class="i-fa-solid-trash"></span>
              </button>
            </div>
          </template>
        </Column>
        <template #footer>Total : {{ items.length }}</template>
      </DataTable>
    </div>

    <GeneralCultureAddModal v-model="showAddModal" @saved="loadItems" />
    <GeneralCultureEditModal
      v-if="editedItem?.id"
      v-model="showEditModal"
      :item-id="editedItem.id"
      @saved="loadItems"
    />
    <ConfirmModal
      v-model="showDeleteModal"
      title="Supprimer l'item ?"
      :message="deleteMessage"
      @confirm="deleteConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import dayjs from 'dayjs'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import useGeneralCulture from '../composables/useGeneralCulture'
import type { TGeneralCulture } from '../../types'
import GeneralCultureAddModal from '../components/GeneralCultureAddModal.vue'
import GeneralCultureEditModal from '../components/GeneralCultureEditModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const { items, loadItems, deleteItem } = useGeneralCulture()
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editedItem = ref<TGeneralCulture.TRecord | null>(null)
const itemToDelete = ref<TGeneralCulture.TRecord | null>(null)
const deleteMessage = computed(() =>
  itemToDelete.value ? `Voulez-vous vraiment supprimer "${itemToDelete.value.name}" ?` : ''
)

type RoleExpand = NonNullable<TGeneralCulture.TRecord['expand']>['Roles']
const roleNames = (roles: RoleExpand) => roles?.length ? roles.map(r => r.name).join(', ') : '—'
const formatDate = (d: string) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : ''

const editItem = (item: TGeneralCulture.TRecord) => { editedItem.value = item; showEditModal.value = true }
const confirmDelete = (item: TGeneralCulture.TRecord) => {
  itemToDelete.value = item
  showDeleteModal.value = true
}
const deleteConfirmed = async () => {
  if (itemToDelete.value) {
    await deleteItem(itemToDelete.value.id)
    await loadItems()
    showDeleteModal.value = false
  }
}

onMounted(loadItems)
</script>
