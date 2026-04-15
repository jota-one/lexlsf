export type TRecord = {
  id: string
  expression: string
  slug: string
  strategies: string
  Signs: string[]
  Roles: string[]
  expand?: {
    Signs?: Array<{ id: string; name: string; slug: string }>
    Roles?: Array<{ id: string; name: string; slug: string }>
  }
  created: string
  updated: string
}

export type TForm = {
  id?: string
  expression: string
  slug?: string
  strategies: string
  Signs: string[]
  Roles: string[]
}
