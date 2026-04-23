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
      expand: 'Sign,Person',
      sort: 'term',
    })
    return terms.value
  }

  const buildFormData = (payload: TLexicalTerm.TForm) => {
    const formData = new FormData()
    formData.append('term', payload.term.trim())
    formData.append('LexicalField', payload.LexicalField)
    formData.append('Sign', payload.Sign || '')
    formData.append('is_person', String(Boolean(payload.is_person)))
    formData.append('description', payload.description || '')
    formData.append('strategy', payload.strategy || '')
    formData.append('start_date', payload.start_date || '')
    formData.append('end_date', payload.end_date || '')
    formData.append('Person', payload.Person || '')
    return formData
  }

  const addTerm = async (payload: TLexicalTerm.TForm) => {
    return pb.collection('lexical_term').create(buildFormData(payload))
  }

  const updateTerm = async (id: string, payload: TLexicalTerm.TForm) => {
    return pb.collection('lexical_term').update(id, buildFormData(payload))
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
