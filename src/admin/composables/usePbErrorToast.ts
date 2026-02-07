import { useToast } from 'primevue/usetoast'

type PbErrorFieldDetail = {
  code?: string
  message?: string
  params?: Record<string, any>
}

/**
 * Formats and shows PocketBase-style errors using PrimeVue toast.
 * Example error shape:
 * {
 *   data: { video: { code, message, params }, ... },
 *   message: 'Failed to create record.',
 *   status: 400
 * }
 */
export default function usePbErrorToast() {
  const toast = useToast()

  function showPbError(e: any) {
    try {
      if (!e) return

      // Accept simple strings or errors without response
      if (typeof e === 'string') {
        toast.add({ severity: 'error', summary: 'Erreur', detail: e, life: 8000 })
        return
      }

      // Normalize error object shape
      const errObject = e?.response ?? e ?? {}

      // Try to locate the PocketBase error payload in common places
      const fieldData = errObject?.data as Record<string, PbErrorFieldDetail> | undefined

      // Top-level message (fallback to stringified error)
      const topMessage =
        errObject?.message ||
        (typeof e?.message === 'string' ? e.message : undefined) ||
        'Erreur serveur'

      const msg: string[] = []
      if (fieldData) {
        // If field errors are arrays or nested objects, normalize them
        Object.entries(fieldData).forEach(([field, errVal]) => {
          let detail = ''
          if (errVal.message) {
            detail = errVal.message
            if (errVal.params?.file) detail += ` (${errVal.params.file})`
            if (errVal.code) detail += ` [${errVal.code}]`
          } else {
            // fallback to JSON
            try {
              detail = JSON.stringify(errVal)
            } catch (e: unknown) {
              console.log('Failed to stringify Pb error detail', e, errVal)
              detail = String(errVal as string)
            }
          }

          msg.push(`${field}: ${detail}`)
        })
      }

      // Build detail
      const detail = msg.length ? `${topMessage}\n${msg.join('\n')}` : topMessage

      // Use formatted message (field prefix)
      toast.add({
        severity: 'error',
        summary: 'Erreur serveur',
        detail,
        life: 8000,
      })

      // If no field data, ensure top-level message was shown (already added above)
    } catch (err) {
      // If toast fails, at least try to show a generic message
      toast.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue',
        life: 6000,
      })
      //
      console.error('Failed to show Pb error toast', err, e)
    }
  }

  return { showPbError }
}
