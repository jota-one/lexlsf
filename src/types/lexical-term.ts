export type TRelatedTerm = {
  id: string
  term: string
  LexicalField: string
  expand?: {
    LexicalField?: { id: string; name: string; slug: string }
  }
}

export type TRecord = {
  id: string
  term: string
  LexicalField: string
  Sign: string
  Type: string
  RelatedTerms: string[]
  note: string
  strategy: string
  expand?: {
    Sign?: { id: string; name: string; slug: string }
    Type?: { id: string; tag: string; slug: string }
    RelatedTerms?: TRelatedTerm[]
    LexicalField?: { id: string; name: string; slug: string }
  }
  created: string
  updated: string
}

export type TForm = {
  id?: string
  term: string
  LexicalField: string
  Sign?: string
  Type?: string
  RelatedTerms?: string[]
  note?: string
  strategy?: string
}
