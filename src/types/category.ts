export type TRecord = {
  id: string
  tag: string
  slug: string
  entities: string[] | string
  Parent?: string
  expand?: {
    category_via_Parent?: TRecord[]
  }
}
