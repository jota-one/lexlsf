export type TTimelineEntry = {
  id?: string
  title: string
  description: string
}

export type TRecord = {
  id: string
  name: string
  firstname?: string
  slug: string
  illustration: string
  description: string
  Sign?: string
  Category: string[]
  Activities: string[]
  Videos: string[]
  timeline?: TTimelineEntry[]
  created: string
  updated: string
  deaf?: boolean
  birthdate?: string
  birthplace?: string
  deafFamily?: boolean
  family?: string
  organism?: boolean
}

export type TForm = Omit<TRecord, 'id' | 'illustration' | 'updated' | 'expand' | 'created'> & {
  id?: string
  slug?: string
  illustration?: File | null
  description?: string
  deaf?: boolean
  firstname?: string
  birthdate?: string
  birthplace?: string
  deafFamily?: boolean
  family?: string
  organism?: boolean
  Sign?: string
  timeline?: TTimelineEntry[]
}
