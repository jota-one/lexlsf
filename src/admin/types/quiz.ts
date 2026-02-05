// Types for the quiz system
export type ItemType = 'sign' | 'person' | 'mixed'
export type QuizResult = 'known' | 'unknown' | 'skip'

export type QuizSettings = {
  shuffle?: boolean
}

export type Quiz = {
  id: string
  Owner: string
  title: string
  description?: string
  item_type: ItemType
  settings?: QuizSettings
  created: string
  updated: string
}

export type QuizItem = {
  id: string
  Quiz: string
  item_type: Exclude<ItemType, 'mixed'>
  item_id: string
  position?: number
  created: string
  updated: string
}

export type QuizSessionSettings = {
  shuffle_seed?: number
}

export type QuizSessionStats = {
  total: number
  known: number
  unknown: number
  skipped: number
}

export type QuizSession = {
  id: string
  Quiz: string
  User: string
  config_key: string
  started_at: string
  completed_at?: string
  settings_snapshot?: QuizSessionSettings
  stats?: QuizSessionStats
  created: string
  updated: string
}

export type QuizAttempt = {
  id: string
  Session: string
  QuizItem: string
  result: QuizResult
  time_spent?: number
  created: string
  updated: string
}
