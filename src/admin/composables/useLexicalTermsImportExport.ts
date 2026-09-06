import useImportExport from './useImportExport'
import { pb } from '@lib/pb'
import {
  applyRelatedTerms,
  getExportableFields,
  getFieldConfig,
  getImportableFields,
  resetCaches,
} from '../config/lexicalTermsImportExport'
import type { TImportExport } from '../types'

export type { TImportExport } from '../types'

/**
 * Terms are always imported/exported in the scope of a single lexical field:
 * the CSV has no `LexicalField` column, it is derived from the current field.
 */
export default function useLexicalTermsImportExport(fieldId: string) {
  const importableFields = (): TImportExport.FieldConfig[] => [
    ...getImportableFields(),
    {
      key: 'LexicalField',
      label: 'Champ lexical',
      exportable: false,
      importable: true,
      derive: () => fieldId,
    },
  ]

  const { isExporting, isImporting, exportToCSV, importFromCSV } = useImportExport(
    'lexical_term',
    getExportableFields,
    importableFields,
    getFieldConfig,
    {
      expand: '',
      labelKey: 'term',
      exportFilter: pb.filter('LexicalField = {:id}', { id: fieldId }),
      onAfterImport: (rows, headers) => applyRelatedTerms(fieldId, rows, headers),
    },
  )

  return {
    isExporting,
    isImporting,
    exportToCSV: async () => {
      resetCaches()
      return exportToCSV()
    },
    importFromCSV: async (file: File) => {
      resetCaches()
      return importFromCSV(file)
    },
  }
}
