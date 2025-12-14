<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
      <span class="i-fa-solid-layer-group"></span>
      Catégories
    </h2>
    <p>Gestion des catégories.</p>
    <div class="card mt-4">
      <div class="flex justify-end mb-2">
        <Button
          label="Ajouter une catégorie"
          icon="i-fa-solid-plus"
          size="small"
          @click="openAddModal"
        />
      </div>
      <div v-if="loadingCategories" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <table class="table table-sm w-full">
          <thead>
            <tr>
              <th>Catégorie</th>
              <th>Slug</th>
              <th>Sous-catégories</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="cat in categories" :key="cat.id">
              <tr>
                <td>{{ cat.tag }}</td>
                <td>{{ cat.slug }}</td>
                <td>
                  <span
                    v-if="cat.expand && cat.expand.category_via_Parent && cat.expand.category_via_Parent.length"
                  >
                    <span
                      v-for="child in cat.expand.category_via_Parent"
                      :key="child.id"
                      class="badge badge-sm badge-outline mr-1 mb-1"
                    >
                      <span
                        class="cursor-pointer"
                        tabindex="0"
                        role="button"
                        @click="togglePopover(child.id, $event)"
                      >
                        {{ child.tag }}
                      </span>
                      <Popover :ref="setPopoverRef(child.id)" dismissable placement="bottom-start">
                        <div class="p-2 flex gap-2">
                          <button
                            class="btn btn-xs btn-ghost"
                            title="Modifier"
                            @click="openEditModalChild(child)"
                          >
                            <span class="i-fa-solid-pen"></span>
                          </button>
                          <button class="btn btn-xs btn-error" @click="confirmDeleteChild(child)">
                            <span class="i-fa-solid-trash"></span>
                          </button>
                        </div>
                      </Popover>
                    </span>
                  </span>
                  <span v-else class="text-gray-400">Aucune</span>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button
                      class="btn btn-xs btn-ghost"
                      title="Ajouter une sous-catégorie"
                      @click="openAddModalWithParent(cat.id)"
                    >
                      <span class="i-fa-solid-plus"></span>
                    </button>
                    <button
                      class="btn btn-xs btn-ghost"
                      title="Supprimer la catégorie"
                      :disabled="!!(cat.expand && cat.expand.category_via_Parent && cat.expand.category_via_Parent.length)"
                      @click="confirmDeleteParent(cat)"
                    >
                      <span class="i-fa-solid-trash"></span>
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
    <CategoryFormModal
      v-model="showAddModal"
      :parent-id="selectedParentId"
      :category-to-edit="categoryToEdit"
      @saved="loadCategories"
    />
    <ConfirmModal
      v-model="showDeleteModal"
      title="Supprimer la catégorie ?"
      :message="deleteMessage"
      @confirm="deleteCategoryConfirmed"
    />
  </div>
</template>
<script setup lang="ts">
// filepath: /Users/joelpoulin/Sites/astro/lexlsf/src/admin/views/Categories.vue
import { ref, onMounted, nextTick } from 'vue';
import useCategories from '../composables/useCategories';
import Button from 'primevue/button';
import CategoryFormModal from '../components/CategoryFormModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import Popover from 'primevue/popover';

const { categories, loadingCategories, loadCategories, deleteCategory } = useCategories();
const showAddModal = ref(false);
const selectedParentId = ref<string | null>(null);
const categoryToEdit = ref<any>(null);

const popoverRefs = ref<{ [id: string]: any }>({});
const showDeleteModal = ref(false);
const categoryToDelete = ref<any>(null);
const deleteMessage = ref('');

// Helper to set popover ref for each child
function setPopoverRef(id: string) {
  return (el: any) => {
    if (el) popoverRefs.value[id] = el;
    else delete popoverRefs.value[id];
  };
}

const openAddModal = () => {
  selectedParentId.value = null;
  categoryToEdit.value = null;
  showAddModal.value = true;
};

const openAddModalWithParent = (parentId: string) => {
  selectedParentId.value = parentId;
  categoryToEdit.value = null;
  showAddModal.value = true;
};

const openEditModalChild = (category: any) => {
  categoryToEdit.value = category;
  selectedParentId.value = null;
  showAddModal.value = true;
  // Hide all popovers
  Object.values(popoverRefs.value).forEach(refPopover => refPopover?.hide && refPopover.hide());
};

const togglePopover = (id: string, event: Event) => {
  // Hide any open popover except the one being toggled
  Object.entries(popoverRefs.value).forEach(([key, refPopover]) => {
    if (key !== id && refPopover?.hide) refPopover.hide();
  });
  // Toggle the clicked popover
  const refPopover = popoverRefs.value[id];
  if (refPopover) {
    refPopover.toggle(event);
  }
};

const confirmDeleteChild = (category: any) => {
  categoryToDelete.value = category;
  deleteMessage.value = `Voulez-vous vraiment supprimer la catégorie "${category.tag}" ? Cette action est irréversible.`;
  showDeleteModal.value = true;
  // Hide all popovers
  Object.values(popoverRefs.value).forEach(refPopover => refPopover?.hide && refPopover.hide());
};

const confirmDeleteParent = (category: any) => {
  // Only allow if no children
  if (category.expand && category.expand.category_via_Parent && category.expand.category_via_Parent.length) return;
  categoryToDelete.value = category;
  deleteMessage.value = `Voulez-vous vraiment supprimer la catégorie "${category.tag}" ? Cette action est irréversible.`;
  showDeleteModal.value = true;
};

const deleteCategoryConfirmed = async () => {
  if (categoryToDelete.value) {
    await deleteCategory(categoryToDelete.value.id);
    await loadCategories();
    showDeleteModal.value = false;
    categoryToDelete.value = null;
  }
};

onMounted(loadCategories);
</script>
