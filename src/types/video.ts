export type TRecord = {
  id: string
  title: string
  url: string
  created: string
  updated: string
}

export type TForm = Omit<TRecord, 'id' | 'created' | 'updated'> & {
  id?: string
}
