import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { createSlug } from '@admin/helpers/strings'
import type { TImportExport } from '../types'
import PocketBase from 'pocketbase'
import config from '../../config'

dayjs.extend(customParseFormat)

const pb = new PocketBase(config.apiBaseUrl)

let rolesMapsPromise: Promise<{
  slugToId: Map<string, string>
  idToSlug: Map<string, string>
}> | null = null
let categoryMapsPromise: Promise<{
  slugToId: Map<string, string>
  idToSlug: Map<string, string>
}> | null = null

const getRolesMaps = async () => {
  if (!rolesMapsPromise) {
    rolesMapsPromise = pb
      .collection('roles')
      .getFullList<{ id: string; slug: string }>({ fields: 'id,slug', sort: 'slug' })
      .then(records => {
        const slugToId = new Map<string, string>()
        const idToSlug = new Map<string, string>()
        records.forEach(role => {
          slugToId.set(role.slug.toLowerCase(), role.id)
          idToSlug.set(role.id, role.slug)
        })
        return { slugToId, idToSlug }
      })
  }
  return rolesMapsPromise
}

const getCategoryMaps = async () => {
  if (!categoryMapsPromise) {
    categoryMapsPromise = pb
      .collection('category')
      .getFullList<{ id: string; slug: string }>({ fields: 'id,slug', sort: 'slug' })
      .then(records => {
        const slugToId = new Map<string, string>()
        const idToSlug = new Map<string, string>()
        records.forEach(category => {
          slugToId.set(category.slug.toLowerCase(), category.id)
          idToSlug.set(category.id, category.slug)
        })
        return { slugToId, idToSlug }
      })
  }
  return categoryMapsPromise
}

// Formatters pour les champs spécifiques
const birthdateFormatter: TImportExport.FieldFormatter = {
  export: (value: string | undefined) => {
    if (!value) return ''
    return dayjs(value).format('DD.MM.YYYY')
  },
  import: (value: string) => {
    if (!value) return ''
    const parsed = dayjs(value, 'DD.MM.YYYY', true)
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : value
  },
}

const booleanFormatter: TImportExport.FieldFormatter = {
  export: (value: boolean | undefined) => {
    if (value === undefined || value === null) return 'non'
    return value ? 'oui' : 'non'
  },
  import: (value: string) => {
    if (!value) return false
    const normalized = value.toLowerCase().trim()
    return normalized === 'oui' || normalized === '1' || normalized === 'true'
  },
}

// Configuration des champs pour l'import/export
export const PERSONS_FIELDS_CONFIG: TImportExport.FieldConfig[] = [
  {
    key: 'id',
    label: 'ID',
    exportable: true,
    importable: true,
  },
  {
    key: 'name',
    label: 'Nom',
    exportable: true,
    importable: true,
  },
  {
    key: 'firstname',
    label: 'Prénom',
    exportable: true,
    importable: true,
  },
  {
    key: 'slug',
    label: 'Slug',
    exportable: true,
    importable: true,
    unique: true,
    derive: row => createSlug(row.name || '', row.firstname),
  },
  {
    key: 'description',
    label: 'Description',
    exportable: true,
    importable: true,
  },
  {
    key: 'Category',
    label: 'Category',
    exportable: true,
    importable: true,
    formatter: {
      export: async (value: string[], row?: Record<string, any>) => {
        const expanded = row?.expand?.Category
        if (Array.isArray(expanded) && expanded.length > 0) {
          return expanded
            .map((category: any) => category?.slug)
            .filter(Boolean)
            .join(',')
        }
        const categoryIds = Array.isArray(value) ? value : []
        if (!categoryIds.length) return ''
        const { idToSlug } = await getCategoryMaps()
        return categoryIds
          .map(id => idToSlug.get(id))
          .filter(Boolean)
          .join(',')
      },
      import: async (value: string) => {
        if (!value?.trim()) return []
        const { slugToId } = await getCategoryMaps()
        const requestedSlugs = value
          .split(/[;,]/)
          .map(slug => slug.trim().toLowerCase())
          .filter(Boolean)
        const missingSlugs = requestedSlugs.filter(slug => !slugToId.has(slug))
        if (missingSlugs.length > 0) {
          throw new Error(`Categories inconnues: ${missingSlugs.join(', ')}`)
        }
        return Array.from(new Set(requestedSlugs.map(slug => slugToId.get(slug)!)))
      },
    },
  },
  {
    key: 'Roles',
    label: 'Roles',
    exportable: true,
    importable: true,
    formatter: {
      export: async (value: string[], row?: Record<string, any>) => {
        const expanded = row?.expand?.Roles
        if (Array.isArray(expanded) && expanded.length > 0) {
          return expanded
            .map((role: any) => role?.slug)
            .filter(Boolean)
            .join(',')
        }
        const roleIds = Array.isArray(value) ? value : []
        if (!roleIds.length) return ''
        const { idToSlug } = await getRolesMaps()
        return roleIds
          .map(id => idToSlug.get(id))
          .filter(Boolean)
          .join(',')
      },
      import: async (value: string) => {
        if (!value?.trim()) return []
        const { slugToId } = await getRolesMaps()
        const requestedSlugs = value
          .split(',')
          .map(slug => slug.trim().toLowerCase())
          .filter(Boolean)
        const missingSlugs = requestedSlugs.filter(slug => !slugToId.has(slug))
        if (missingSlugs.length > 0) {
          throw new Error(`Roles inconnus: ${missingSlugs.join(', ')}`)
        }
        return Array.from(new Set(requestedSlugs.map(slug => slugToId.get(slug)!)))
      },
    },
  },
  {
    key: 'deaf',
    label: 'Sourd(e)',
    exportable: true,
    importable: true,
    formatter: booleanFormatter,
  },
  {
    key: 'organism',
    label: 'Organisme',
    exportable: true,
    importable: true,
    formatter: booleanFormatter,
  },
  {
    key: 'birthdate',
    label: 'Date de naissance',
    exportable: true,
    importable: true,
    formatter: birthdateFormatter,
  },
  {
    key: 'birthplace',
    label: 'Lieu de naissance',
    exportable: true,
    importable: true,
  },
  {
    key: 'deafFamily',
    label: 'Famille sourde',
    exportable: true,
    importable: true,
    formatter: booleanFormatter,
  },
  {
    key: 'family',
    label: 'Famille',
    exportable: true,
    importable: true,
  },
  {
    key: 'deceased',
    label: 'Décédé(e)/Dissout',
    exportable: true,
    importable: true,
    formatter: booleanFormatter,
  },
  {
    key: 'deathdate',
    label: 'Date de décès',
    exportable: true,
    importable: true,
    formatter: birthdateFormatter,
  },
]

// Helpers pour obtenir les champs exportables/importables
export const getExportableFields = () => PERSONS_FIELDS_CONFIG.filter(field => field.exportable)

export const getImportableFields = () => PERSONS_FIELDS_CONFIG.filter(field => field.importable)

export const getFieldConfig = (key: string) =>
  PERSONS_FIELDS_CONFIG.find(field => field.key === key)
