import { createSlug } from '@admin/helpers/strings'
import type { TImportExport } from '../types'
import PocketBase from 'pocketbase'
import config from '../../config'

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

// Configuration des champs pour l'import/export des signes
export const SIGNS_FIELDS_CONFIG: TImportExport.FieldConfig[] = [
  {
    key: 'id',
    label: 'ID',
    exportable: true,
    importable: true,
  },
  {
    key: 'name',
    label: 'Terme',
    exportable: true,
    importable: true,
  },
  {
    key: 'slug',
    label: 'Slug',
    exportable: true,
    importable: true,
    unique: true,
    derive: row => createSlug(row.name || ''),
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
        if (!categoryIds.length) {
          return ''
        }

        const { idToSlug } = await getCategoryMaps()
        return categoryIds
          .map(id => idToSlug.get(id))
          .filter(Boolean)
          .join(',')
      },
      import: async (value: string) => {
        if (!value?.trim()) {
          return []
        }

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
    key: 'definition',
    label: 'Définition',
    exportable: true,
    importable: true,
  },
  {
    key: 'verification_status',
    label: 'Statut de vérification',
    exportable: true,
    importable: true,
  },
  {
    key: 'level',
    label: 'Niveau',
    exportable: true,
    importable: true,
    formatter: {
      import: (value: string) => {
        return value.toLowerCase().trim()
      },
    },
  },
  {
    key: 'learning_source',
    label: "Source d'apprentissage",
    exportable: true,
    importable: true,
  },
  {
    key: 'learning_source_detail',
    label: 'Précision source',
    exportable: true,
    importable: true,
  },
  {
    key: 'primary_language',
    label: 'Langue principale',
    exportable: true,
    importable: true,
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
        if (!roleIds.length) {
          return ''
        }

        const { idToSlug } = await getRolesMaps()
        return roleIds
          .map(id => idToSlug.get(id))
          .filter(Boolean)
          .join(',')
      },
      import: async (value: string) => {
        if (!value?.trim()) {
          return []
        }

        const { slugToId } = await getRolesMaps()
        const requestedSlugs = value
          .split(',')
          .map(slug => slug.trim().toLowerCase())
          .filter(Boolean)

        const missingSlugs = requestedSlugs.filter(slug => !slugToId.has(slug))
        if (missingSlugs.length > 0) {
          throw new Error(`Roles inconnus: ${missingSlugs.join(', ')}`)
        }

        const uniqueIds = Array.from(new Set(requestedSlugs.map(slug => slugToId.get(slug)!)))
        return uniqueIds
      },
    },
  },
]

// Helpers pour obtenir les champs exportables/importables
export const getExportableFields = () => SIGNS_FIELDS_CONFIG.filter(field => field.exportable)

export const getImportableFields = () => SIGNS_FIELDS_CONFIG.filter(field => field.importable)

export const getFieldConfig = (key: string) => SIGNS_FIELDS_CONFIG.find(field => field.key === key)
