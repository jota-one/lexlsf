import { ref } from 'vue'
import config from '../../config'
import PocketBase from 'pocketbase'
import type { TLexicalTerm } from '../../types'

export default function useLexicalTerms() {
  const pb = new PocketBase(config.apiBaseUrl)

  const terms = ref<TLexicalTerm.TRecord[]>([])

  const loadTermsByField = async (lexicalFieldId: string) => {
    terms.value = await pb.collection<TLexicalTerm.TRecord>('lexical_term').getFullList({
      filter: `LexicalField = "${lexicalFieldId}"`,
      expand: 'Sign',
      sort: 'term',
    })
    return terms.value
  }

  const addTerm = async (payload: TLexicalTerm.TForm) => {
    const formData = new FormData()
    formData.append('term', payload.term.trim())
    formData.append('LexicalField', payload.LexicalField)
    if (payload.Sign) {
      formData.append('Sign', payload.Sign)
    }
    return pb.collection('lexical_term').create(formData)
  }

  const updateTerm = async (id: string, payload: TLexicalTerm.TForm) => {
    const formData = new FormData()
    formData.append('term', payload.term.trim())
    formData.append('LexicalField', payload.LexicalField)
    formData.append('Sign', payload.Sign || '')
    return pb.collection('lexical_term').update(id, formData)
  }

  const deleteTerm = async (id: string) => {
    return pb.collection('lexical_term').delete(id)
  }

  return {
    terms,
    loadTermsByField,
    addTerm,
    updateTerm,
    deleteTerm,
  }
}
