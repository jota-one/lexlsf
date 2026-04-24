export type TRecord = {
  id: string
  name: string
  slug: string
  description: string
  start_date: string
  end_date: string
  images: string[]
  LexicalFields: string[]
  Signs: string[]
  Persons: string[]
  Roles: string[]
  expand?: {
    Roles?: Array<{ id: string; name: string; slug: string }>
    LexicalFields?: Array<{ id: string; name: string; slug: string }>
    Signs?: Array<{ id: string; name: string }>
    Persons?: Array<{ id: string; name: string; firstname: string; slug: string }>
  }
  created: string
  updated: string
}

export type TForm = {
  id?: string
  name: string
  slug?: string
  description: string
  start_date: string
  end_date: string
  LexicalFields: string[]
  Signs: string[]
  Persons: string[]
  Roles: string[]
  newImages?: File[]
  removedImages?: string[]
}
