<template>
  <CategoriesPickerForm v-model="selectedCategories" entity="lexical_field" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import useCategories from '../composables/useCategories'
import CategoriesPickerForm from './CategoriesPickerForm.vue'
import type { TCategory } from '../../types'

/**
 * Bridges the flat list of category ids stored on the record with the
 * { [parentId]: childId[] } shape expected by CategoriesPickerForm.
 */
const model = defineModel<string[]>({ required: true })

const { categories, loadCategories } = useCategories()
const selectedCategories = ref<{ [parentId: string]: string[] }>({})
const initialized = ref(false)

watch(
  [categories, model],
  () => {
    if (initialized.value) {
      return
    }
    if (!categories.value.length) {
      return
    }
    initialized.value = true
    const flatIds = model.value || []
    const result: { [parentId: string]: string[] } = {}
    for (const parent of categories.value.filter((c: TCategory.TRecord) => !c.Parent)) {
      const children = (parent.expand?.category_via_Parent || []) as TCategory.TRecord[]
      result[parent.id] = children
        .filter((c: TCategory.TRecord) => flatIds.includes(c.id))
        .map((c: TCategory.TRecord) => c.id)
    }
    selectedCategories.value = result
  },
  { immediate: true },
)

watch(
  selectedCategories,
  val => {
    if (!initialized.value) {
      return
    }
    model.value = Object.values(val).flat()
  },
  { deep: true },
)

onMounted(() => loadCategories('lexical_field'))
</script>
