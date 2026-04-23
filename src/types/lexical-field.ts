import type { TSign } from '.'

export type TRecord = {
  id: string
  name: string
  slug: string
  introduction: string
  Roles: string[]
  Categories: string[]
  expand?: {
    Roles?: Array<{ id: string; name: string; slug: string }>
    Categories?: Array<{ id: string; tag: string; Parent: string }>
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
  Categories: string[]
}
