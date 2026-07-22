export type TRole = {
  id: string
  slug: string
  name?: string
}

export type TRecord = {
  id: string
  email: string
  name?: string
  avatar?: string
  expand?: {
    roles?: TRole[]
  }
}
