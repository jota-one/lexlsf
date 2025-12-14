import { shallowRef, useTemplateRef } from 'vue'
import { useSortable } from '@vueuse/integrations/useSortable'

/**
 * useSortableList - Composable réutilisable pour gérer le drag & drop avec sortablejs
 *
 * Ce composable encapsule toute la logique de configuration de useSortable de VueUse,
 * permettant une réutilisation facile dans d'autres composants.
 *
 * @example
 * ```typescript
 * const {
 *   items,
 *   container,
 *   setItems,
 *   addItem,
 *   removeItem,
 *   updateItem,
 *   getItems,
 *   getItemIds
 * } = useSortableList<MyItem>('containerRef', initialData, {
 *   animation: 200,
 *   handle: '.handle',
 * });
 * ```
 *
 * Dans le template:
 * ```vue
 * <div ref="container">
 *   <div v-for="item in items" :key="item.id">
 *     <span class="handle">≡</span>
 *     <span>{{ item.title }}</span>
 *   </div>
 * </div>
 * ```
 *
 * @typeParam T - Le type des items, doit avoir une propriété 'id'
 * @param refName - Le nom de la template ref pour le conteneur
 * @param initialItems - Les items initiaux (optionnel)
 * @param options - Options de configuration
 * @returns Objet contenant items, container et méthodes utilitaires
 */
interface SortableListOptions<T> {
  animation?: number
  handle?: string
  onUpdate?: (items: T[]) => void
}

export function useSortableList<T extends { id: string }>(
  refName: string,
  initialItems?: T[],
  options: SortableListOptions<T> = {},
) {
  const { animation = 200, handle = '.handle' } = options

  const items = shallowRef<T[]>(initialItems || [])
  const container = useTemplateRef<HTMLDivElement>(refName)

  // Initialiser useSortable
  useSortable(container, items, {
    animation,
    handle,
  })

  const setItems = (newItems: T[]) => {
    console.log('setItems', newItems)

    items.value = [...newItems]
  }

  const addItem = (item: T) => {
    items.value = [...items.value, item]
  }

  const removeItem = (index: number) => {
    items.value.splice(index, 1)
  }

  const updateItem = (index: number, updatedItem: T) => {
    items.value[index] = updatedItem
    // Forcer le re-render
    items.value = [...items.value]
  }

  const getItems = () => items.value

  const getItemIds = () => items.value.map(item => item.id)

  return {
    items,
    container,
    setItems,
    addItem,
    removeItem,
    updateItem,
    getItems,
    getItemIds,
  }
}
