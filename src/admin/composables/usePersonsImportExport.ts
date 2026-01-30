import useImportExport from './useImportExport'
import {
  getExportableFields,
  getImportableFields,
  getFieldConfig,
} from '../config/personsImportExport'

export type { TImportExport } from '../types'

export default function usePersonsImportExport() {
  return useImportExport('person', getExportableFields, getImportableFields, getFieldConfig)
}
