import { pbFetch, type Auth } from './index'

export type TypeCategory = { id: string; created: boolean }

/**
 * Ensures a category tagged `lexical_term` exists to serve as a term "Type".
 * Returns whether it was created here so the caller can clean it up.
 */
export async function ensureTermType(admin: Auth, tag: string): Promise<TypeCategory> {
  const existing = await pbFetch(
    '/api/collections/category/records?perPage=1&filter=' + encodeURIComponent(`tag="${tag}"`),
    {},
    admin.token,
  )
  const found = (await existing.json()) as { items?: { id: string }[] }
  if (found.items?.[0]) {
    return { id: found.items[0].id, created: false }
  }

  const res = await pbFetch(
    '/api/collections/category/records',
    {
      method: 'POST',
      body: JSON.stringify({ tag, slug: `e2e-${tag.toLowerCase()}`, entities: ['lexical_term'] }),
    },
    admin.token,
  )
  if (!res.ok) {
    throw new Error(`Could not create term type "${tag}": ${res.status} ${await res.text()}`)
  }
  const record = (await res.json()) as { id: string }
  return { id: record.id, created: true }
}

/** Deletes a lexical field and, via cascade, all its terms. */
export async function deleteLexicalField(admin: Auth, id: string) {
  await pbFetch(`/api/collections/lexical_field/records/${id}`, { method: 'DELETE' }, admin.token)
}

/** Deletes a category by id (used to remove a term type created for a test). */
export async function deleteCategory(admin: Auth, id: string) {
  await pbFetch(`/api/collections/category/records/${id}`, { method: 'DELETE' }, admin.token)
}

/** Lists the terms of a lexical field with their relations expanded. */
export async function listTerms(admin: Auth, fieldId: string) {
  const res = await pbFetch(
    '/api/collections/lexical_term/records?perPage=200&expand=Type,RelatedTerms&filter=' +
      encodeURIComponent(`LexicalField="${fieldId}"`),
    {},
    admin.token,
  )
  const data = (await res.json()) as {
    items: Array<{
      id: string
      term: string
      Type: string
      RelatedTerms: string[]
      note: string
      strategy: string
    }>
  }
  return data.items
}
