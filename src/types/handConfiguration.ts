export type TRecord = {
  id: string
  name: string
  illustration: string
}

/** The illustration is the stored file name until a new file is picked. */
export type TForm = {
  name: string
  illustration: File | string | null
}
