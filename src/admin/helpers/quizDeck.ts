export type DeckItemBase = {
  quizItemId: string
  itemType: 'sign' | 'person'
  itemId: string
  position: number
  isSkipRequeue?: boolean
}

type QuizItemLike = {
  id: string
  item_type: string
  item_id: string
  position: number
}

type AttemptLike = {
  QuizItem: string
  result: string
}

export const shuffle = <T>(arr: T[]): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Split the quiz items of a resumed session into:
 *   - unattempted: never answered nor skipped
 *   - skippedOnly: skipped at least once and never definitively answered
 * Definitively answered items (known/unknown) are excluded.
 */
export const partitionResumedItems = (quizItems: QuizItemLike[], attempts: AttemptLike[]) => {
  const definitivelyAnswered = new Set(
    attempts.filter(a => a.result === 'known' || a.result === 'unknown').map(a => a.QuizItem),
  )
  const skippedOnly = new Set(
    attempts
      .filter(a => a.result === 'skip')
      .map(a => a.QuizItem)
      .filter(id => !definitivelyAnswered.has(id)),
  )

  const allDeckItems: DeckItemBase[] = quizItems.map(item => ({
    quizItemId: item.id,
    itemType: item.item_type as 'sign' | 'person',
    itemId: item.item_id,
    position: item.position,
  }))

  return {
    unattempted: allDeckItems.filter(
      item => !definitivelyAnswered.has(item.quizItemId) && !skippedOnly.has(item.quizItemId),
    ),
    skippedOnly: allDeckItems.filter(item => skippedOnly.has(item.quizItemId)),
  }
}

/**
 * Where to re-insert a skipped card: at a random position within the
 * "skipped zone" (the run of re-queued cards after the current position),
 * or at the end of the deck if that zone doesn't exist yet.
 * The returned index is always after the current position.
 */
export const computeSkipInsertIndex = (
  deck: { isSkipRequeue?: boolean }[],
  currentIndex: number,
): number => {
  let skippedZoneStart = -1
  for (let i = currentIndex + 1; i < deck.length; i++) {
    if (deck[i].isSkipRequeue) {
      skippedZoneStart = i
      break
    }
  }
  if (skippedZoneStart === -1) {
    return deck.length
  }
  return skippedZoneStart + Math.floor(Math.random() * (deck.length - skippedZoneStart + 1))
}
