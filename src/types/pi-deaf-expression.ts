export type TRecord = {
  id: string
  name: string
  slug: string
  strategies: string
  Sign: string
  Roles: string[]
  expand?: {
    Sign?: { id: string; name: string; slug: string; video: string }
    Roles?: Array<{ id: string; name: string; slug: string }>
  }
  created: string
  updated: string
}

export type TForm = {
  id?: string
  name?: string
  slug?: string
  strategies: string
  Sign: string
  Roles: string[]
}
