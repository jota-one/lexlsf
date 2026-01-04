import { ref } from 'vue'
import config from '../../config'
import PocketBase from 'pocketbase'
import type { TPerson } from '../../types'
import {
  getExportableFields,
  getFieldConfig,
  getImportableFields,
} from '../config/personsImportExport'

export type TImportResult = {
  processed: number
  created: number
  updated: number
  unchanged: number
  success: number
  errors: Array<{ line: number; name: string; error: string }>
}

export default function usePersonsImportExport() {
  const pb = new PocketBase(config.apiBaseUrl)
  const isExporting = ref(false)
  const isImporting = ref(false)

  const logImport = (
    level: 'info' | 'warn' | 'error',
    message: string,
    payload?: Record<string, any>,
  ) => {
    const logger = level === 'warn' ? console.warn : level === 'error' ? console.error : console.log
    if (payload) {
      logger(`[persons-import] ${message}`, payload)
    } else {
      logger(`[persons-import] ${message}`)
    }
  }

  /**
   * Export persons to CSV format
   */
  const exportToCSV = async () => {
    isExporting.value = true
    try {
      const persons = await pb.collection<TPerson.TRecord>('person').getFullList({
        expand: 'Category',
      })

      const exportableFields = getExportableFields()
      const headers = exportableFields.map(field => field.key)

      // Create CSV content
      const csvRows = [headers.join(',')]

      persons.forEach(person => {
        const row = exportableFields.map(fieldConfig => {
          const value = (person as any)[fieldConfig.key]

          // Apply formatter if exists
          if (fieldConfig.formatter?.export) {
            return escapeCSV(fieldConfig.formatter.export(value))
          }

          // Default formatting based on field type
          if (fieldConfig.key === 'Category') {
            return (value || []).join(';')
          }

          if (typeof value === 'boolean') {
            return value ? '1' : '0'
          }

          if (value === null || value === undefined) {
            return ''
          }

          return escapeCSV(String(value))
        })
        csvRows.push(row.join(','))
      })

      const csvContent = csvRows.join('\n')
      downloadFile(csvContent, 'persons-export.csv', 'text/csv')
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Import persons from CSV file
   */
  const importFromCSV = async (file: File): Promise<TImportResult> => {
    isImporting.value = true
    const result: TImportResult = {
      processed: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      success: 0,
      errors: [],
    }

    logImport('info', 'début import CSV', { filename: file.name, size: file.size })

    try {
      const text = await file.text()
      const rows = parseCSV(text)

      if (rows.length < 2) {
        throw new Error('Le fichier CSV est vide ou invalide')
      }

      // Parse header
      const headers = rows[0]

      // Process each line
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i]
        if (!values || values.every(v => v === '')) continue

        try {
          const person: any = {}

          headers.forEach((header, index) => {
            const value = values[index] || ''
            const fieldConfig = getFieldConfig(header)

            if (!fieldConfig || !fieldConfig.importable) {
              return
            }

            // Apply formatter if exists
            if (fieldConfig.formatter?.import) {
              person[header] = fieldConfig.formatter.import(value)
              return
            }

            // Default formatting based on field key
            if (header === 'Category') {
              person[header] = value ? value.split(';').filter(Boolean) : []
              return
            }

            if (header === 'deaf' || header === 'organism' || header === 'deafFamily') {
              person[header] = value === '1' || value.toLowerCase() === 'true'
              return
            }

            if (
              header === 'description' ||
              header === 'name' ||
              header === 'firstname' ||
              header === 'slug' ||
              header === 'birthplace' ||
              header === 'family'
            ) {
              person[header] = unescapeCSV(value)
              return
            }

            person[header] = value
          })

          // Apply derive functions for missing values
          getImportableFields().forEach((fieldConfig: any) => {
            if (
              fieldConfig.derive &&
              (person[fieldConfig.key] === undefined ||
                person[fieldConfig.key] === null ||
                person[fieldConfig.key] === '')
            ) {
              person[fieldConfig.key] = fieldConfig.derive(person)
            }
          })

          // Check if person exists by ID
          if (person.id) {
            try {
              const existing = await pb.collection('person').getOne(person.id)
              const diff = recordDiff(person, existing)

              if (diff.hasChanges) {
                logImport('info', 'mise à jour', {
                  id: person.id,
                  diffs: diff.diffs,
                })
                await pb.collection('person').update(person.id, person)
                result.updated++
              } else {
                logImport('info', 'inchangé', { id: person.id })
                result.unchanged++
              }
            } catch {
              // Create new (ID doesn't exist)
              delete person.id
              logImport('info', 'création (id absent en base)', {
                tempId: person.id,
              })
              await pb.collection('person').create(person)
              result.created++
            }
          } else {
            // Create new person
            logImport('info', 'création (sans id)')
            await pb.collection('person').create(person)
            result.created++
          }
        } catch (error: any) {
          // Extract detailed error message from PocketBase
          let errorMessage = 'Erreur inconnue'

          // PocketBase SDK typically returns errors on error.data, but keep response.data fallback
          const pbError = error?.data || error?.response?.data
          if (pbError) {
            if (pbError.message) {
              errorMessage = pbError.message
            }
            if (pbError.data) {
              const fieldErrors = Object.entries(pbError.data)
                .map(([field, err]: [string, any]) => {
                  const message = err?.message || err?.code || String(err)
                  return `${field}: ${message}`
                })
                .join('; ')
              if (fieldErrors) {
                errorMessage = fieldErrors
              }
            }
          } else if (error?.message) {
            errorMessage = error.message
          }

          logImport('warn', 'erreur import ligne', {
            line: i + 1,
            name: values[headers.indexOf('name')] || 'Inconnu',
            error: errorMessage,
          })

          result.errors.push({
            line: i + 1,
            name: values[headers.indexOf('name')] || 'Inconnu',
            error: errorMessage,
          })
        } finally {
          result.processed++
          result.success = result.created + result.updated + result.unchanged
        }
      }
    } finally {
      isImporting.value = false
    }

    logImport('info', 'fin import CSV', {
      processed: result.processed,
      created: result.created,
      updated: result.updated,
      unchanged: result.unchanged,
      errors: result.errors.length,
    })

    return result
  }

  // Utility functions
  const escapeCSV = (value: string): string => {
    if (!value) return ''
    const stringValue = String(value)
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  const unescapeCSV = (value: string): string => {
    if (!value) return ''
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1).replace(/""/g, '"')
    }
    return value
  }

  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = []
    let row: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const nextChar = text[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
        continue
      }

      if (!inQuotes && (char === '\n' || char === '\r')) {
        row.push(current)
        current = ''
        if (!(row.length === 1 && row[0] === '')) {
          rows.push(row)
        }
        row = []
        // Skip CRLF second char
        if (char === '\r' && nextChar === '\n') {
          i++
        }
        continue
      }

      if (!inQuotes && char === ',') {
        row.push(current)
        current = ''
        continue
      }

      current += char
    }

    // Push last value/row
    row.push(current)
    if (!(row.length === 1 && row[0] === '')) {
      rows.push(row)
    }

    return rows
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const recordDiff = (
    incoming: Record<string, any>,
    existing: Record<string, any>,
  ): { hasChanges: boolean; diffs: Array<{ key: string; incoming: any; existing: any }> } => {
    const diffs: Array<{ key: string; incoming: any; existing: any }> = []

    Object.keys(incoming)
      .filter(key => key !== 'id')
      .forEach(key => {
        const incomingVal = incoming[key]
        const existingVal = existing[key]
        if (!isEqualValue(incomingVal, existingVal, key)) {
          diffs.push({ key, incoming: incomingVal, existing: existingVal })
        }
      })

    return { hasChanges: diffs.length > 0, diffs }
  }

  const isEqualValue = (a: any, b: any, key?: string): boolean => {
    const canonicalize = (value: any, fieldKey?: string) => {
      const config = fieldKey ? getFieldConfig(fieldKey) : undefined

      if (value === '') value = null

      if (Array.isArray(value)) {
        return fieldKey === 'Category' ? [...value].sort() : value
      }

      if (!config || !config.formatter) {
        return value ?? null
      }

      const { formatter } = config

      if (formatter.export && formatter.import) {
        const exported = formatter.export(value)
        return formatter.import(exported)
      }

      if (formatter.import) {
        return formatter.import(String(value ?? ''))
      }

      if (formatter.export) {
        return formatter.export(value)
      }

      return value ?? null
    }

    const normA = canonicalize(a, key)
    const normB = canonicalize(b, key)

    if (Array.isArray(normA) && Array.isArray(normB)) {
      if (normA.length !== normB.length) return false
      return normA.every((item, idx) => item === normB[idx])
    }

    return normA === normB
  }

  return {
    isExporting,
    isImporting,
    exportToCSV,
    importFromCSV,
  }
}
