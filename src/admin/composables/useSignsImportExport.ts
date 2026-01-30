import useImportExport from './useImportExport'
import {
  getExportableFields,
  getImportableFields,
  getFieldConfig,
} from '../config/signsImportExport'

export default function useSignsImportExport() {
  return useImportExport('sign', getExportableFields, getImportableFields, getFieldConfig)
}
