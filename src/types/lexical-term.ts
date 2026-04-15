export type TRecord = {
  id: string
  term: string
  LexicalField: string
  Sign: string
  expand?: {
    Sign?: { id: string; name: string; slug: string }
  }
  created: string
  updated: string
}

export type TForm = {
  id?: string
  term: string
  LexicalField: string
  Sign?: string
}
