export type FieldFormatter = {
  export?: (value: unknown, row?: Record<string, unknown>) => string | Promise<string>
  import?: (value: string, row?: Record<string, unknown>) => unknown
}

export type FieldConfig = {
  key: string
  label: string
  exportable: boolean
  importable: boolean
  unique?: boolean
  formatter?: FieldFormatter
  derive?: (row: Record<string, unknown>) => unknown
}

export type ImportResult = {
  processed: number
  created: number
  updated: number
  unchanged: number
  success: number
  errors: Array<{ line: number; name: string; error: string }>
}
