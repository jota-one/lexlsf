import { ref } from 'vue'
import config from '../../config'
import PocketBase from 'pocketbase'
import type { TLexicalField } from '../../types'
import { createSlug } from '@admin/helpers/strings'

const setFormData = (payload: TLexicalField.TForm) => {
  const formData = new FormData()
  formData.append('name', payload.name.trim())
  formData.append('slug', payload.slug || createSlug(payload.name))
  formData.append('introduction', payload.introduction || '')
  ;(payload.Roles || []).forEach(roleId => {
    formData.append('Roles', roleId)
  })
  if ((payload.Roles || []).length === 0) {
    formData.append('Roles', '')
  }
  return formData
}

export default function useLexicalFields() {
  const pb = new PocketBase(config.apiBaseUrl)

  const lexicalFields = ref<TLexicalField.TRecord[]>([])

  const loadLexicalFields = async () => {
    const [fields, terms] = await Promise.all([
      pb.collection<TLexicalField.TRecord>('lexical_field').getFullList({
        expand: 'Roles',
        sort: 'name',
      }),
      pb.collection('lexical_term').getFullList({ fields: 'LexicalField', requestKey: null }),
    ])
    const countMap = new Map<string, number>()
    for (const t of terms) {
      countMap.set(t.LexicalField, (countMap.get(t.LexicalField) ?? 0) + 1)
    }
    lexicalFields.value = fields.map(f => ({ ...f, _termCount: countMap.get(f.id) ?? 0 }))
  }

  const loadLexicalField = async (id: string) => {
    return pb.collection<TLexicalField.TRecord>('lexical_field').getOne(id, {
      expand: 'Roles',
    })
  }

  const addLexicalField = async (payload: TLexicalField.TForm) => {
    return pb.collection('lexical_field').create(setFormData(payload))
  }

  const updateLexicalField = async (id: string, payload: TLexicalField.TForm) => {
    return pb.collection('lexical_field').update(id, setFormData(payload))
  }

  const deleteLexicalField = async (id: string) => {
    return pb.collection('lexical_field').delete(id)
  }

  return {
    lexicalFields,
    loadLexicalFields,
    loadLexicalField,
    addLexicalField,
    updateLexicalField,
    deleteLexicalField,
  }
}
