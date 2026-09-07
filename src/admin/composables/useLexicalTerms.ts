import { ref } from 'vue'
import { pb } from '@lib/pb'
import type { TLexicalTerm } from '../../types'

const TERM_EXPAND = 'Sign,Type,RelatedTerms,RelatedTerms.LexicalField'

// SQLite sorts accented letters after Z, so re-sort in JS for a proper
// locale-aware order (É next to E) before display.
const byTerm = (a: TLexicalTerm.TRecord, b: TLexicalTerm.TRecord) => a.term.localeCompare(b.term)

export default function useLexicalTerms() {
  const terms = ref<TLexicalTerm.TRecord[]>([])

  const loadTermsByField = async (lexicalFieldId: string) => {
    const list = await pb.collection<TLexicalTerm.TRecord>('lexical_term').getFullList({
      filter: pb.filter('LexicalField = {:id}', { id: lexicalFieldId }),
      expand: TERM_EXPAND,
    })
    terms.value = list.sort(byTerm)
    return terms.value
  }

  /**
   * All terms, used by the related-terms picker (links are allowed across fields).
   */
  const loadAllTerms = async () => {
    const list = await pb.collection<TLexicalTerm.TRecord>('lexical_term').getFullList({
      expand: 'LexicalField',
    })
    return list.sort(byTerm)
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

  /** Links are one-way: only the edited term's own list is written. */
  const addTerm = async (payload: TLexicalTerm.TForm) => {
    return pb.collection<TLexicalTerm.TRecord>('lexical_term').create(buildPayload(payload))
  }

  const updateTerm = async (id: string, payload: TLexicalTerm.TForm) => {
    return pb.collection<TLexicalTerm.TRecord>('lexical_term').update(id, buildPayload(payload))
  }

  /** Patches only the sign relation, leaving the rest of the term untouched. */
  const setTermSign = async (id: string, signId: string) => {
    return pb.collection('lexical_term').update(id, { Sign: signId })
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
    setTermSign,
    deleteTerm,
  }
}
