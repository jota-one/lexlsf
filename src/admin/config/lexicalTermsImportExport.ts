import { pb } from '@lib/pb'
import type { TImportExport } from '../types'

type TTypeMaps = { tagToId: Map<string, string>; idToTag: Map<string, string> }

let typeMapsPromise: Promise<TTypeMaps> | null = null

/**
 * Categories usable as a term "Type", i.e. those tagged with the
 * `lexical_term` entity.
 */
const getTypeMaps = async () => {
  if (!typeMapsPromise) {
    typeMapsPromise = pb
      .collection('category')
      .getFullList<{ id: string; tag: string; entities: string[] }>({
        fields: 'id,tag,entities',
        sort: 'tag',
      })
      .then(records => {
        const tagToId = new Map<string, string>()
        const idToTag = new Map<string, string>()
        records
          .filter(category => (category.entities || []).includes('lexical_term'))
          .forEach(category => {
            tagToId.set(category.tag.toLowerCase(), category.id)
            idToTag.set(category.id, category.tag)
          })
        return { tagToId, idToTag }
      })
  }
  return typeMapsPromise
}

let termNamesPromise: Promise<Map<string, string>> | null = null

/** Term id -> term name, used to export the `related` column by name. */
const getTermNames = async () => {
  if (!termNamesPromise) {
    termNamesPromise = pb
      .collection('lexical_term')
      .getFullList<{ id: string; term: string }>({ fields: 'id,term' })
      .then(records => new Map(records.map(record => [record.id, record.term])))
  }
  return termNamesPromise
}

/** Both caches are per-run: reset them before each import/export. */
export const resetCaches = () => {
  typeMapsPromise = null
  termNamesPromise = null
}

const FIELDS: TImportExport.FieldConfig[] = [
  { key: 'id', label: 'ID', exportable: true, importable: true },
  { key: 'term', label: 'Terme', exportable: true, importable: true },
  {
    key: 'Type',
    label: 'Type',
    exportable: true,
    importable: true,
    formatter: {
      export: async (value: unknown) => {
        if (!value) {
          return ''
        }
        const { idToTag } = await getTypeMaps()
        return idToTag.get(value as string) || ''
      },
      import: async (value: string) => {
        const tag = (value || '').trim()
        if (!tag) {
          return ''
        }
        const { tagToId } = await getTypeMaps()
        const id = tagToId.get(tag.toLowerCase())
        if (!id) {
          throw new Error(`Type "${tag}" inconnu (catégorie absente ou non taggée "lexical_term")`)
        }
        return id
      },
    },
  },
  { key: 'strategy', label: 'Stratégie', exportable: true, importable: true },
  { key: 'note', label: 'Note personnelle', exportable: true, importable: true },
  // Resolved in a second pass, once every term of the file exists.
  {
    key: 'related',
    label: 'Termes liés',
    exportable: true,
    importable: false,
    formatter: {
      export: async (_value: unknown, record?: Record<string, unknown>) => {
        const ids = (record?.RelatedTerms as string[]) || []
        if (ids.length === 0) {
          return ''
        }
        const names = await getTermNames()
        return ids
          .map(id => names.get(id))
          .filter(Boolean)
          .join(';')
      },
    },
  },
]

export const getExportableFields = () => FIELDS.filter(field => field.exportable)
export const getImportableFields = () => FIELDS.filter(field => field.importable)
export const getFieldConfig = (key: string) => FIELDS.find(field => field.key === key)

type TTermRow = { id: string; term: string; LexicalField: string; RelatedTerms: string[] }

/**
 * Second import pass: resolve the `related` column by term name.
 *
 * Links are additive — the column only ever adds links (on both sides),
 * never removes existing ones. Unlinking is done from the admin UI.
 */
export const applyRelatedTerms = async (fieldId: string, rows: string[][], headers: string[]) => {
  const termIndex = headers.indexOf('term')
  const relatedIndex = headers.indexOf('related')
  if (termIndex === -1 || relatedIndex === -1) {
    return
  }

  const allTerms = await pb.collection('lexical_term').getFullList<TTermRow>({
    fields: 'id,term,LexicalField,RelatedTerms',
  })

  const byName = new Map<string, TTermRow[]>()
  for (const term of allTerms) {
    const key = term.term.trim().toLowerCase()
    byName.set(key, [...(byName.get(key) || []), term])
  }

  const errors: string[] = []
  const additions = new Map<string, Set<string>>()

  const addLink = (fromId: string, toId: string) => {
    if (!additions.has(fromId)) {
      additions.set(fromId, new Set())
    }
    additions.get(fromId)?.add(toId)
  }

  for (const row of rows) {
    const name = (row[termIndex] || '').trim()
    const rawRelated = (row[relatedIndex] || '').trim()
    if (!name || !rawRelated) {
      continue
    }

    const self = allTerms.find(
      term =>
        term.LexicalField === fieldId && term.term.trim().toLowerCase() === name.toLowerCase(),
    )
    if (!self) {
      continue
    }

    for (const wanted of rawRelated
      .split(';')
      .map(part => part.trim())
      .filter(Boolean)) {
      const matches = byName.get(wanted.toLowerCase()) || []
      if (matches.length === 0) {
        errors.push(`"${name}" → terme lié "${wanted}" introuvable`)
        continue
      }
      if (matches.length > 1) {
        errors.push(
          `"${name}" → terme lié "${wanted}" ambigu : ${matches.length} termes portent ce nom`,
        )
        continue
      }
      const target = matches[0]
      if (target.id === self.id) {
        continue
      }
      addLink(self.id, target.id)
      addLink(target.id, self.id)
    }
  }

  for (const [termId, linkedIds] of additions) {
    const current = allTerms.find(term => term.id === termId)?.RelatedTerms || []
    const merged = [...new Set([...current, ...linkedIds])]
    if (merged.length === current.length) {
      continue
    }
    await pb.collection('lexical_term').update(termId, { RelatedTerms: merged })
  }

  if (errors.length > 0) {
    throw new Error(errors.join(' ; '))
  }
}
