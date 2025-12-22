<template>
  <div class="flex flex-col gap-4 w-full">
    <!-- Champ de recherche -->
    <div class="flex items-center gap-2">
      <span class="i-fa-solid-search text-base-content/50"></span>
      <InputText
        v-model="categoryFilter"
        type="text"
        placeholder="Filtrer les catégories..."
        class="w-full"
      />
    </div>

    <template v-for="parent in visibleParentCategories" :key="parent.id">
      <div>
        <span class="font-semibold mb-2 block">{{ parent.tag }}</span>
        <div class="flex flex-wrap gap-2">
          <template v-for="child in filteredChildCategoryOptions(parent)" :key="child.id">
            <input
              type="checkbox"
              :id="`${props.entity}-cat-${parent.id}-${child.id}`"
              :value="child.id"
              :checked="selectedCategories[parent.id]?.includes(child.id)"
              @change="toggleCategory(parent.id, child.id)"
              class="sr-only"
            />
            <label
              :for="`${props.entity}-cat-${parent.id}-${child.id}`"
              class="badge badge-sm cursor-pointer"
              :class="selectedCategories[parent.id]?.includes(child.id) ? 'badge-primary' : ''"
            >
              {{ child.tag }}
            </label>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import useCategories from '@admin/composables/useCategories';
import InputText from 'primevue/inputtext';
import { ref, computed, watch, onMounted } from 'vue';

type Props = {
    entity: string
}
const props = defineProps<Props>();

const categoryFilter = ref('');
const selectedCategories = defineModel<{ [parentId: string]: string[] }>({ required: true });

const { categories, loadCategories } = useCategories();

// Parent categories (those with Parent == null)
const parentCategories = computed(() =>
    categories.value.filter((cat) => !cat.Parent)
);

// Normalize string for filtering (lowercase, remove accents)
const normalizeString = (str: string) => {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};

// Filtered children for a given parent
const filteredChildCategoryOptions = (parent: any) => {
    const children = parent.expand?.category_via_Parent || [];
    if (!categoryFilter.value.trim()) {
        return children;
    }
    const filter = normalizeString(categoryFilter.value);
    return children.filter((child: any) => normalizeString(child.tag).includes(filter));
};

// Only show parent categories that have at least one visible child
const visibleParentCategories = computed(() => {
    if (!categoryFilter.value.trim()) {
        return parentCategories.value;
    }
    return parentCategories.value.filter((parent: any) => {
        const filteredChildren = filteredChildCategoryOptions(parent);
        return filteredChildren.length > 0;
    });
});

// When categories are loaded, initialize selectedCategories
watch(categories, () => {
    parentCategories.value.forEach(parent => {
    if (!(parent.id in selectedCategories.value)) {
      selectedCategories.value[parent.id] = [];
    }
    });
});

const toggleCategory = (parentId: string, childId: string) => {
    // Ensure it's an array
    if (!Array.isArray(selectedCategories.value[parentId])) {
        selectedCategories.value[parentId] = [];
    }
    const categories = selectedCategories.value[parentId] as string[];
    const index = categories.indexOf(childId);
    if (index > -1) {
        categories.splice(index, 1);
    } else {
        categories.push(childId);
    }
};

onMounted(() => {
    loadCategories(props.entity);
});
</script>
