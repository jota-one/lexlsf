import type { CategoryResponse, PersonResponse, SignResponse, VideoResponse } from './pocketbase-types'

export type TTimelineEntry = {
  id?: string
  title: string
  description: string
}

export type TRecord = {
  id: string
  name: string
  firstname?: string
  slug: string
  illustration: string
  description: string
  Sign?: string
  Category: string[]
  Activities: string[]
  Videos: string[]
  timeline?: TTimelineEntry[]
  created: string
  updated: string
  deaf?: boolean
  birthdate?: string
  birthplace?: string
  deafFamily?: boolean
  family?: string
  organism?: boolean
  deceased?: boolean
  deathdate?: string
  Roles?: string[]
}

export type TForm = Omit<
  TRecord,
  'id' | 'illustration' | 'updated' | 'expand' | 'created' | 'slug'
> & {
  id?: string
  slug?: string
  illustration?: File | null
  description?: string
  deaf?: boolean
  firstname?: string
  birthdate?: string
  birthplace?: string
  deafFamily?: boolean
  family?: string
  organism?: boolean
  deceased?: boolean
  deathdate?: string
  Sign?: string
  timeline?: TTimelineEntry[]
}

/** A person as the public detail page loads it, with its relations expanded. */
export type TDetail = PersonResponse<
  unknown,
  TTimelineEntry[],
  {
    Sign?: SignResponse
    Category?: CategoryResponse<{ Parent?: CategoryResponse }>[]
    Videos?: VideoResponse[]
    Activities?: CategoryResponse[]
  }
>
