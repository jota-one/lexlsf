import { ref, computed } from 'vue'
import config from '../../config'
import PocketBase from 'pocketbase'
import type { QuizSession, QuizAttempt, QuizResult, QuizSessionStats } from '../types/quiz'
import { getQuizMode } from '../config/quizModes'

type QuizSessionRecord = QuizSession & {
  id: string
  created: string
  updated: string
}

type QuizAttemptRecord = QuizAttempt & {
  id: string
  created: string
  updated: string
}

type DeckItem = {
  quizItemId: string
  itemType: 'sign' | 'person'
  itemId: string
  position: number
  itemData?: any // The actual sign or person record
}

const BATCH_SIZE = 20 // Load 20 items at a time for video optimization

export default function useQuizSession() {
  const pb = new PocketBase(config.apiBaseUrl)
  pb.autoCancellation(false)

  const currentSession = ref<QuizSessionRecord | null>(null)
  const deck = ref<DeckItem[]>([])
  const currentIndex = ref(0)
  const loading = ref(false)
  const loadingBatch = ref(false)

  const currentCard = computed(() => {
    if (currentIndex.value >= deck.value.length) return null
    return deck.value[currentIndex.value]
  })

  const progress = computed(() => {
    if (!currentSession.value) return { current: 0, total: 0, percentage: 0 }
    const stats = currentSession.value.stats || { total: 0, known: 0, unknown: 0, skipped: 0 }
    const completed = stats.known + stats.unknown + stats.skipped
    return {
      current: completed,
      total: stats.total,
      percentage: stats.total > 0 ? Math.round((completed / stats.total) * 100) : 0,
    }
  })

  const isComplete = computed(() => {
    return progress.value.current >= progress.value.total
  })

  /**
   * Start a new quiz session
   */
  const startSession = async (quizId: string, configKey: string) => {
    loading.value = true
    try {
      // Get quiz and its items
      const quiz = await pb.collection('quiz').getOne(quizId)
      const quizItems = await pb.collection('quiz_item').getFullList({
        filter: `Quiz = "${quizId}"`,
        sort: 'position',
      })

      // Validate config key
      const mode = getQuizMode(configKey)
      if (!mode) {
        throw new Error(`Invalid config key: ${configKey}`)
      }

      // Filter items by mode itemType (supports mixed quizzes)
      const filteredItems = quizItems.filter(item => item.item_type === mode.itemType)
      if (filteredItems.length === 0) {
        throw new Error(`Aucun item de type ${mode.itemType} dans ce quiz`)
      }

      // Create session
      const userId = pb.authStore.record?.id
      if (!userId) {
        throw new Error('Utilisateur non authentifié')
      }

      currentSession.value = await pb.collection<QuizSessionRecord>('quiz_session').create({
        Quiz: quizId,
        User: userId,
        config_key: configKey,
        started_at: new Date().toISOString(),
        settings_snapshot: quiz.settings || {},
        stats: {
          total: filteredItems.length,
          known: 0,
          unknown: 0,
          skipped: 0,
        },
      })

      // Initialize deck with filtered quiz items (without data yet)
      deck.value = filteredItems.map(item => ({
        quizItemId: item.id,
        itemType: item.item_type,
        itemId: item.item_id,
        position: item.position,
      }))

      currentIndex.value = 0

      // Load first batch
      await loadNextBatch()

      return currentSession.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Resume an existing session
   */
  const resumeSession = async (sessionId: string) => {
    loading.value = true
    try {
      currentSession.value = await pb.collection<QuizSessionRecord>('quiz_session').getOne(sessionId)

      if (!currentSession.value) {
        throw new Error('Session not found')
      }

      // Get quiz items
      const quizItems = await pb.collection('quiz_item').getFullList({
        filter: `Quiz = "${currentSession.value.Quiz}"`,
        sort: 'position',
      })

      // Get existing attempts for this session
      const attempts = await pb.collection<QuizAttemptRecord>('quiz_attempt').getFullList({
        filter: `Session = "${sessionId}"`,
      })

      const attemptedItemIds = new Set(attempts.map(a => a.QuizItem))

      // Initialize deck
      deck.value = quizItems.map(item => ({
        quizItemId: item.id,
        itemType: item.item_type,
        itemId: item.item_id,
        position: item.position,
      }))

      // Find first unattempted item
      currentIndex.value = deck.value.findIndex(item => !attemptedItemIds.has(item.quizItemId))
      if (currentIndex.value === -1) {
        currentIndex.value = deck.value.length // Session complete
      }

      // Load batch around current position
      await loadNextBatch()

      return currentSession.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Load the next batch of items (lazy loading for videos)
   */
  const loadNextBatch = async () => {
    if (!currentSession.value) return

    loadingBatch.value = true
    try {
      const mode = getQuizMode(currentSession.value.config_key)
      if (!mode) return

      // Derive collection name from item type
      const collectionName = mode.itemType === 'sign' ? 'sign' : 'person'
      const startIdx = currentIndex.value
      const endIdx = Math.min(startIdx + BATCH_SIZE, deck.value.length)

      // Get items in current batch that don't have data yet
      const itemsToLoad = deck.value
        .slice(startIdx, endIdx)
        .filter(item => !item.itemData && item.itemType === mode.itemType)

      if (itemsToLoad.length === 0) return

      // Fetch all items in batch
      const itemIds = itemsToLoad.map(item => item.itemId)
      // Build expand list from mode fields that are relations
      const expandFields = [...mode.faceA, ...mode.faceB]
        .filter(field => field.type === 'relation')
        .map(field => field.key)
      
      const records = await pb.collection(collectionName).getFullList({
        filter: itemIds.map(id => `id = "${id}"`).join(' || '),
        expand: expandFields.join(','),
      })

      // Map records back to deck items
      const recordMap = new Map(records.map(r => [r.id, r]))
      itemsToLoad.forEach(item => {
        item.itemData = recordMap.get(item.itemId)
      })
    } finally {
      loadingBatch.value = false
    }
  }

  /**
   * Log an attempt for the current card
   */
  const logAttempt = async (result: QuizResult, timeSpent?: number) => {
    if (!currentSession.value || !currentCard.value) return

    // Create attempt record
    await pb.collection<QuizAttemptRecord>('quiz_attempt').create({
      Session: currentSession.value.id,
      QuizItem: currentCard.value.quizItemId,
      result,
      time_spent: timeSpent,
    })

    // Update session stats
    const stats = currentSession.value.stats as QuizSessionStats
    // Map 'skip' result to 'skipped' in stats
    if (result === 'skip') {
      stats.skipped++
    } else {
      stats[result]++
    }

    currentSession.value = await pb.collection<QuizSessionRecord>('quiz_session').update(
      currentSession.value.id,
      { stats }
    )

    // Move to next card
    currentIndex.value++

    // Check if we need to load next batch
    const remainingInBatch = deck.value.slice(currentIndex.value, currentIndex.value + BATCH_SIZE)
    const unloadedCount = remainingInBatch.filter(item => !item.itemData).length

    if (unloadedCount > BATCH_SIZE / 2 && currentIndex.value < deck.value.length) {
      // Preload next batch when we're halfway through current batch
      await loadNextBatch()
    }
  }

  /**
   * Complete the session
   */
  const completeSession = async () => {
    if (!currentSession.value) return

    currentSession.value = await pb.collection<QuizSessionRecord>('quiz_session').update(
      currentSession.value.id,
      {
        completed_at: new Date().toISOString(),
      }
    )

    return currentSession.value
  }

  /**
   * Get previous sessions for a quiz
   * @param quizId - Quiz ID
   * @param options - Optional filters
   * @param options.configKey - Filter by specific quiz mode
   * @param options.onlyIncomplete - Only return sessions without completed_at
   * @param options.limit - Maximum number of sessions to return (default: 50)
   */
  const loadQuizSessions = async (
    quizId: string,
    options?: {
      configKey?: string
      onlyIncomplete?: boolean
      limit?: number
    }
  ) => {
    const filters = [`Quiz = "${quizId}"`]

    if (options?.onlyIncomplete) {
      filters.push('completed_at = null')
    }

    if (options?.configKey) {
      filters.push(`config_key = "${options.configKey}"`)
    }

    return pb.collection<QuizSessionRecord>('quiz_session').getFullList({
      filter: filters.join(' && '),
      sort: '-started_at',
      perPage: options?.limit || 50,
    })
  }

  /**
   * Delete a session (expects cascade to delete attempts)
   */
  const deleteSession = async (sessionId: string) => {
    return pb.collection('quiz_session').delete(sessionId)
  }

  /**
   * Get attempts for a session
   */
  const loadSessionAttempts = async (sessionId: string) => {
    return pb.collection<QuizAttemptRecord>('quiz_attempt').getFullList({
      filter: `Session = "${sessionId}"`,
      expand: 'QuizItem',
      sort: 'created',
    })
  }

  /**
   * Get file URL for media (video, illustration)
   */
  const getFileUrl = (collectionName: string, recordId: string, filename: string) => {
    if (!filename) return ''
    return `${config.apiBaseUrl}/api/files/${collectionName}/${recordId}/${filename}`
  }

  /**
   * Reset current session state
   */
  const reset = () => {
    currentSession.value = null
    deck.value = []
    currentIndex.value = 0
  }

  return {
    // State
    currentSession,
    deck,
    currentIndex,
    currentCard,
    progress,
    isComplete,
    loading,
    loadingBatch,

    // Methods
    startSession,
    resumeSession,
    loadNextBatch,
    logAttempt,
    completeSession,
    loadQuizSessions,
    deleteSession,
    loadSessionAttempts,
    getFileUrl,
    reset,
  }
}
