import type { TCategory, THandConfiguration } from '.'
import type {
  CategoryResponse,
  HandConfigurationsResponse,
  PersonResponse,
  SignResponse,
} from './pocketbase-types'

export type TPlacement = {
  right: string[]
  left: string[]
}

export type TMovement = {
  type?: string
  orientation?: string
  amplitude?: string
  speed?: string
  precision?: string
  repetitions?: number
}

export type TMovements = {
  right: TMovement
  left: TMovement
}

export type TRecord = {
  id: string
  name: string
  slug: string
  definition: string
  video: string
  level: string
  verification_status: string
  Category: string[]
  ConfigurationRight: string
  ConfigurationLeft: string
  learning_source: string
  learning_source_detail: string
  primary_language: string
  Roles: string[]
  placement: TPlacement
  movements: TMovements
  expand: {
    Category?: TCategory.TRecord[]
    ConfigurationRight?: {
      id: string
      name: string
      illustration: string
    }
    ConfigurationLeft?: {
      id: string
      name: string
      illustration: string
    }
    Roles?: Array<{
      id: string
      name: string
      slug: string
    }>
  }
  created: string
  updated: string
}

export type TForm = Omit<
  TRecord,
  | 'id'
  | 'level'
  | 'slug'
  | 'video'
  | 'updated'
  | 'ConfigurationRight'
  | 'ConfigurationLeft'
  | 'expand'
  | 'created'
> & {
  id?: string
  slug?: string
  video?: File | null
  level: number
  Roles: string[]
  ConfigurationRight: Partial<THandConfiguration.TRecord>
  ConfigurationLeft: Partial<THandConfiguration.TRecord>
}

/** A sign as the public detail page loads it, with its relations expanded. */
export type TDetail = SignResponse<
  TPlacement,
  {
    Category?: CategoryResponse[]
    ConfigurationRight?: HandConfigurationsResponse
    ConfigurationLeft?: HandConfigurationsResponse
    person_via_Sign?: PersonResponse[]
  }
>
