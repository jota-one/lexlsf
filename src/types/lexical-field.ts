import type { TSign } from '.'

export type TRecord = {
  id: string
  name: string
  slug: string
  introduction: string
  Roles: string[]
  expand?: {
    Roles?: Array<{ id: string; name: string; slug: string }>
  }
  created: string
  updated: string
}

export type TForm = {
  id?: string
  name: string
  slug?: string
  introduction: string
  Roles: string[]
}
