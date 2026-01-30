export type FieldFormatter = {
  export?: (value: any) => string
  import?: (value: string) => any
}

export type FieldConfig = {
  key: string
  label: string
  exportable: boolean
  importable: boolean
  formatter?: FieldFormatter
  derive?: (row: Record<string, any>) => any
}

export type ImportResult = {
  processed: number
  created: number
  updated: number
  unchanged: number
  success: number
  errors: Array<{ line: number; name: string; error: string }>
}
