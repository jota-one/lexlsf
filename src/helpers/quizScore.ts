export type ScoreInput = {
  known: number
  unknown: number
  skipped: number
  total: number
  durationSeconds: number
}

const REF_SECONDS_PER_CARD = 6

/**
 * Compute a 0–100 quiz score:
 *   - Base: accuracy (known / total)
 *   - Skip deduction: up to −20 pts (linear, capped at 1 skip/card)
 *   - Time bonus/malus: +15 pts max (faster) / −5 pts max (slower)
 */
export const computeQuizScore = ({
  known,
  total,
  skipped,
  durationSeconds,
}: ScoreInput): number => {
  if (total === 0) return 0

  const accuracy = known / total
  const skipDeduction = Math.min(skipped / total, 1) * 20

  const refTime = REF_SECONDS_PER_CARD * total
  const timeRatio = durationSeconds > 0 ? refTime / durationSeconds : 1
  const timeBonus = Math.max(-5, Math.min(15, (timeRatio - 1) * 15))

  return Math.round(Math.max(0, Math.min(100, accuracy * 100 - skipDeduction + timeBonus)))
}

export const scoreColorClass = (score: number): string => {
  if (score >= 80) return 'text-success'
  if (score >= 50) return 'text-warning'
  return 'text-error'
}
