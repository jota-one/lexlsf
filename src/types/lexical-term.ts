export type TRecord = {
  id: string
  term: string
  LexicalField: string
  Sign: string
  is_person: boolean
  description: string
  strategy: string
  start_date: string
  end_date: string
  Person: string
  expand?: {
    Sign?: { id: string; name: string; slug: string }
    Person?: { id: string; name: string; firstname: string; slug: string }
  }
  created: string
  updated: string
}

export type TForm = {
  id?: string
  term: string
  LexicalField: string
  Sign?: string
  is_person?: boolean
  description?: string
  strategy?: string
  start_date?: string
  end_date?: string
  Person?: string
}
