import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { createSlug } from '@admin/helpers/strings'

dayjs.extend(customParseFormat)

export type TFieldFormatter = {
  export?: (value: any) => string
  import?: (value: string) => any
}

export type TFieldConfig = {
  key: string
  label: string
  exportable: boolean
  importable: boolean
  formatter?: TFieldFormatter
  derive?: (row: Record<string, any>) => any // Permet de générer une valeur si absente à l'import
}

// Formatters pour les champs spécifiques
const birthdateFormatter: TFieldFormatter = {
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

const booleanFormatter: TFieldFormatter = {
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
export const PERSONS_FIELDS_CONFIG: TFieldConfig[] = [
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
    derive: row => createSlug(row.name || '', row.firstname),
  },
  {
    key: 'description',
    label: 'Description',
    exportable: true,
    importable: true,
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
]

// Helpers pour obtenir les champs exportables/importables
export const getExportableFields = () => PERSONS_FIELDS_CONFIG.filter(field => field.exportable)

export const getImportableFields = () => PERSONS_FIELDS_CONFIG.filter(field => field.importable)

export const getFieldConfig = (key: string) =>
  PERSONS_FIELDS_CONFIG.find(field => field.key === key)
