import { ref } from 'vue'
import config from '../../config'
import PocketBase from 'pocketbase'
import type { Quiz, QuizItem } from '../types/quiz'

export type QuizRecord = Quiz & {
  id: string
  created: string
  updated: string
}

export type QuizItemRecord = QuizItem & {
  id: string
  created: string
  updated: string
}

export type QuizFormData = {
  title: string
  description?: string
  item_type: 'sign' | 'person' | 'mixed'
  settings?: Record<string, any>
  items: Array<{
    item_type: 'sign' | 'person'
    item_id: string
    position: number
  }>
}

export default function useQuizzes() {
  const pb = new PocketBase(config.apiBaseUrl)
  pb.autoCancellation(false)

  const quizzes = ref<QuizRecord[]>([])
  const loading = ref(false)
  const quizItemCounts = ref<Record<string, number>>({})
  
  type QuizCountRow = {
    id: string
    items_count: number
  }

  /**
   * Load all quizzes for the current user
   */
  const loadQuizzes = async () => {
    loading.value = true
    try {
      // Fetch quizzes and counts (SQL view) concurrently
      const [quizRows, countRows] = await Promise.all([
        pb.collection<QuizRecord>('quiz').getFullList({ sort: '-updated' }),
        pb.collection<QuizCountRow>('quiz_counts').getFullList(),
      ])

      quizzes.value = quizRows
      quizItemCounts.value = Object.fromEntries(
        countRows.map((r) => [r.id, Number(r.items_count) || 0])
      )
    } finally {
      loading.value = false
    }
  }

  /**
   * Load a single quiz with its items
   */
  const loadQuiz = async (id: string) => {
    const quiz = await pb.collection<QuizRecord>('quiz').getOne(id)
    const items = await pb.collection<QuizItemRecord>('quiz_item').getFullList({
      filter: `Quiz = "${id}"`,
      sort: 'position',
    })
    return { quiz, items }
  }

  /**
   * Create a new quiz with items
   */
  const createQuiz = async (data: QuizFormData) => {
    // Create the quiz first
    const quiz = await pb.collection<QuizRecord>('quiz').create({
      Owner: pb.authStore.record?.id,
      title: data.title,
      description: data.description || '',
      item_type: data.item_type,
      settings: data.settings || {},
    })

    // Create all quiz items
    const itemPromises = data.items.map(item =>
      pb.collection<QuizItemRecord>('quiz_item').create({
        Quiz: quiz.id,
        item_type: item.item_type,
        item_id: item.item_id,
        position: item.position,
      })
    )

    await Promise.all(itemPromises)

    return quiz
  }

  /**
   * Update a quiz (title, description, settings only)
   * Items are managed separately
   */
  const updateQuiz = async (
    id: string,
    data: Partial<Pick<QuizFormData, 'title' | 'description' | 'settings'>>
  ) => {
    return pb.collection<QuizRecord>('quiz').update(id, data)
  }

  /**
   * Delete a quiz (cascade will delete items automatically)
   */
  const deleteQuiz = async (id: string) => {
    return pb.collection('quiz').delete(id)
  }

  /**
   * Add items to an existing quiz
   */
  const addQuizItems = async (
    quizId: string,
    items: Array<{ item_type: 'sign' | 'person'; item_id: string }>
  ) => {
    // Get current max position
    const existingItems = await pb.collection<QuizItemRecord>('quiz_item').getFullList({
      filter: `Quiz = "${quizId}"`,
      sort: '-position',
      fields: 'position',
    })

    // Guard against undefined/NaN positions; PocketBase position is required and must be >= 1
    const maxPositionRaw = existingItems.length > 0 ? existingItems[0]?.position : 0
    const maxPositionClean = Number.isFinite(Number(maxPositionRaw)) ? Number(maxPositionRaw) : 0
    const maxPosition = Math.max(0, maxPositionClean)

    // Create new items with incremented positions
    const itemPromises = items.map((item, index) =>
      pb.collection<QuizItemRecord>('quiz_item').create({
        Quiz: quizId,
        item_type: item.item_type,
        item_id: item.item_id,
        position: maxPosition + 1 + index,
      })
    )

    return Promise.all(itemPromises)
  }

  /**
   * Remove items from a quiz
   */
  const removeQuizItems = async (itemIds: string[]) => {
    const deletePromises = itemIds.map(id => pb.collection('quiz_item').delete(id))
    return Promise.all(deletePromises)
  }

  /**
   * Reorder quiz items
   */
  const reorderQuizItems = async (items: Array<{ id: string; position: number }>) => {
    const updatePromises = items.map(item =>
      pb.collection<QuizItemRecord>('quiz_item').update(item.id, {
        position: item.position,
      })
    )
    return Promise.all(updatePromises)
  }

  return {
    quizzes,
    loading,
    quizItemCounts,
    loadQuizzes,
    loadQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    addQuizItems,
    removeQuizItems,
    reorderQuizItems,
  }
}
