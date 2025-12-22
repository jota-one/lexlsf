<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
      <span class="i-fa-solid-user-friends"></span>
      Personnes importantes
    </h2>
    <div class="card">
      <div class="flex justify-end mb-2">
        <Button
          label="Ajouter une personne"
          icon="i-fa-solid-plus"
          size="small"
          @click="openAddModal"
        />
      </div>
      <DataTable :value="persons" sortField="updated" :sortOrder="-1" tableStyle="min-width: 50rem">
        <Column style="width: 40px;" :header="''">
          <template #body="slotProps">
            <template v-if="getPersonProblems(slotProps.data).length">
              <button
                class="btn btn-xs btn-ghost"
                v-tooltip="getPersonProblems(slotProps.data).join('\n')"
              >
                <span
                  class="i-fa6-solid-triangle-exclamation text-warning text-lg cursor-pointer"
                ></span>
              </button>
            </template>
          </template>
        </Column>
        <Column style="width: 60px;" :header="''">
          <template #body="slotProps">
            <img
              v-if="slotProps.data.illustration"
              :src="getIllustrationUrl(slotProps.data)"
              :alt="slotProps.data.name"
              class="w-12 h-12 object-cover rounded"
            />
          </template>
        </Column>
        <Column field="name" header="Nom" sortable>
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <span>
                {{ slotProps.data.organism
                  ? slotProps.data.name
                  : [slotProps.data.firstname, slotProps.data.name].filter(Boolean).join(' ') }}
              </span>
              <span
                class="badge badge-xs"
                :class="slotProps.data.organism ? 'badge-info' : 'badge-accent'"
              >
                {{ slotProps.data.organism ? 'Organisme' : 'Personne' }}
              </span>
            </div>
          </template>
        </Column>
        <Column field="category" header="Catégorie(s)">
          <template #body="slotProps">
            {{ categories(slotProps.data.expand?.Category) }}
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
                @click="editPerson(slotProps.data)"
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
        <template #footer>
          Nombre total de personnes: {{ persons ? persons.length : 0 }}.
        </template>
      </DataTable>
    </div>
    <PersonAddModal v-model="showAddModal" @saved="loadPersons" />
    <PersonEditModal
      v-if="editedPerson?.id"
      v-model="showEditModal"
      :sign-id="editedPerson?.id"
      @saved="loadPersons"
    />
    <ConfirmModal
      v-model="showDeleteModal"
      title="Supprimer la personne ?"
      :message="deleteMessage"
      @confirm="deletePersonConfirmed"
    />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import usePersons from '../composables/usePersons';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button'
import PersonAddModal from '../components/PersonAddModal.vue';
import PersonEditModal from '../components/PersonEditModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import type { TPerson } from '../../types';

// Retourne la liste des problèmes pour un signe
function getPersonProblems(person: TPerson.TRecord): string[] {
  const problems: string[] = [];
  const p: any = person;
  // Absence d'illustration
  if (!p.illustration) {
    problems.push("Absence d'illustration");
  }

  // Vérification : la personne doit avoir un signe associé (1-1).
  // Acceptons plusieurs formes possibles :
  // - p.Sign : id string (relation 1-1 stored as id)
  // - p.expand?.Sign : expanded record/object
  // - éventuellement p.expand?.Sign being an array (defensive)
  const hasSign = Boolean(p.Sign) || Boolean(p.expand && (p.expand.Sign || (Array.isArray(p.expand.Sign) && p.expand.Sign.length)));
  if (!hasSign) {
    problems.push('Aucun signe associé');
  }

  return problems;
}

const { persons, loadPersons, deletePerson, getIllustrationUrl } = usePersons();
const showAddModal = ref(false);
const showEditModal = ref(false);

const showDeleteModal = ref(false);
const personToDelete = ref<any>(null);
const editedPerson = ref<any>(null);
const deleteMessage = ref('');

const categories = (category: any[]) => {
  return (category || []).map(c => c.tag).join(', ')
};

const openAddModal = () => {
  showAddModal.value = true;
};

const editPerson = (person: any) => {
  editedPerson.value = person;
  showEditModal.value = true;
};

const confirmDelete = (person: any) => {
  personToDelete.value = person;
  deleteMessage.value = `Voulez-vous vraiment supprimer la personne "${person.name}" ? Cette action est irréversible.`;
  showDeleteModal.value = true;
};

const deletePersonConfirmed = async () => {
  if (personToDelete.value) {
    await deletePerson(personToDelete.value.id);
    await loadPersons();
    showDeleteModal.value = false;
    personToDelete.value = null;
  }
};

const formatDate = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

onMounted(loadPersons)
</script>
