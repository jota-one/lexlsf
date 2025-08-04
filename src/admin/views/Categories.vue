<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
      <span class="i-fa-solid-layer-group"></span>
      Catégories
    </h2>
    <p>Gestion des catégories.</p>
    <div class="card mt-4">
      <div class="flex justify-end mb-2">
        <Button label="Ajouter une catégorie" icon="i-fa-solid-plus" size="small" @click="showAddModal = true" />
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
            </tr>
          </thead>
          <tbody>
            <template v-for="cat in categories" :key="cat.id">
              <tr>
                <td>{{ cat.tag }}</td>
                <td>{{ cat.slug }}</td>
                <td>
                  <span v-if="cat.expand && cat.expand.category_via_Parent && cat.expand.category_via_Parent.length">
                    <span v-for="child in cat.expand.category_via_Parent" :key="child.id"
                      class="badge badge-sm badge-outline mr-1">
                      {{ child.tag }}
                    </span>
                  </span>
                  <span v-else class="text-gray-400">Aucune</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
    <CategoryFormModal v-model="showAddModal" @saved="loadCategories" />
  </div>
</template>
<script setup lang="ts">
// filepath: /Users/joelpoulin/Sites/astro/lexlsf/src/admin/views/Categories.vue
import { ref, onMounted } from 'vue';
import useCategories from '../composables/useCategories';
import Button from 'primevue/button';
import CategoryFormModal from '../components/CategoryFormModal.vue';

const { categories, loadingCategories, loadCategories } = useCategories();
const showAddModal = ref(false);

onMounted(loadCategories);
</script>