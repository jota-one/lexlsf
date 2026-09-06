import { ref } from 'vue'
import { pb } from '@lib/pb'
import type { TLexicalTerm } from '../../types'

const TERM_EXPAND = 'Sign,Type,RelatedTerms,RelatedTerms.LexicalField'

export default function useLexicalTerms() {
  const terms = ref<TLexicalTerm.TRecord[]>([])

  const loadTermsByField = async (lexicalFieldId: string) => {
    terms.value = await pb.collection<TLexicalTerm.TRecord>('lexical_term').getFullList({
      filter: pb.filter('LexicalField = {:id}', { id: lexicalFieldId }),
      expand: TERM_EXPAND,
      sort: 'term',
    })
    return terms.value
  }

  /**
   * All terms, used by the related-terms picker (links are allowed across fields).
   */
  const loadAllTerms = async () => {
    return pb.collection<TLexicalTerm.TRecord>('lexical_term').getFullList({
      expand: 'LexicalField',
      sort: 'term',
    })
  }

  const buildPayload = (payload: TLexicalTerm.TForm) => ({
    term: payload.term.trim(),
    LexicalField: payload.LexicalField,
    Sign: payload.Sign || '',
    Type: payload.Type || '',
    note: payload.note || '',
    strategy: payload.strategy || '',
    RelatedTerms: payload.RelatedTerms || [],
  })

  /**
   * Links are symmetric: whenever a term's RelatedTerms change, the other side
   * is updated too, so a link can be read and removed from either term.
   */
  const syncRelatedTerms = async (termId: string, nextIds: string[], previousIds: string[]) => {
    const added = nextIds.filter(id => !previousIds.includes(id))
    const removed = previousIds.filter(id => !nextIds.includes(id))

    for (const otherId of added) {
      const other = await pb.collection<TLexicalTerm.TRecord>('lexical_term').getOne(otherId)
      const links = other.RelatedTerms || []
      if (links.includes(termId)) {
        continue
      }
      await pb.collection('lexical_term').update(otherId, { RelatedTerms: [...links, termId] })
    }

    for (const otherId of removed) {
      const other = await pb.collection<TLexicalTerm.TRecord>('lexical_term').getOne(otherId)
      const links = other.RelatedTerms || []
      if (!links.includes(termId)) {
        continue
      }
      await pb.collection('lexical_term').update(otherId, {
        RelatedTerms: links.filter(id => id !== termId),
      })
    }
  }

  const addTerm = async (payload: TLexicalTerm.TForm) => {
    const created = await pb
      .collection<TLexicalTerm.TRecord>('lexical_term')
      .create(buildPayload(payload))
    await syncRelatedTerms(created.id, payload.RelatedTerms || [], [])
    return created
  }

  const updateTerm = async (id: string, payload: TLexicalTerm.TForm) => {
    const existing = await pb.collection<TLexicalTerm.TRecord>('lexical_term').getOne(id)
    const updated = await pb
      .collection<TLexicalTerm.TRecord>('lexical_term')
      .update(id, buildPayload(payload))
    await syncRelatedTerms(id, payload.RelatedTerms || [], existing.RelatedTerms || [])
    return updated
  }

  const deleteTerm = async (id: string) => {
    // PocketBase strips the deleted id from the other records' relation lists.
    return pb.collection('lexical_term').delete(id)
  }

  return {
    terms,
    loadTermsByField,
    loadAllTerms,
    addTerm,
    updateTerm,
    deleteTerm,
  }
}
