import { createSlug } from '@admin/helpers/strings'
import type { TImportExport } from '../types'

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
    derive: row => createSlug(row.name || ''),
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
]

// Helpers pour obtenir les champs exportables/importables
export const getExportableFields = () => SIGNS_FIELDS_CONFIG.filter(field => field.exportable)

export const getImportableFields = () => SIGNS_FIELDS_CONFIG.filter(field => field.importable)

export const getFieldConfig = (key: string) => SIGNS_FIELDS_CONFIG.find(field => field.key === key)
