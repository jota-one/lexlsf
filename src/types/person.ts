export type TBioEntry = {
  id?: string
  title: string
  description: string
}

export type TRecord = {
  id: string
  name: string
  slug: string
  illustration: string
  description: string
  Sign?: string
  Category: string[]
  Videos: string[]
  highlights?: TBioEntry[]
  created: string
  updated: string
  deaf?: boolean
  birthdate?: string
  birthplace?: string
  deafFamily?: boolean
  family?: string
}

export type TForm = Omit<
  TRecord,
  'id' | 'slug' | 'illustration' | 'updated' | 'expand' | 'created'
> & {
  id?: string
  illustration?: File | null
  description?: string
  deaf?: boolean
  birthdate?: string
  birthplace?: string
  deafFamily?: boolean
  family?: string
  Sign?: string
  highlights?: TBioEntry[]
}
