import { ref } from 'vue'
import config from '../../config'
import PocketBase from 'pocketbase'
import type { TPiDeafExpression } from '../../types'
import { createSlug } from '@admin/helpers/strings'

const setFormData = (payload: TPiDeafExpression.TForm) => {
  const formData = new FormData()
  formData.append('Sign', payload.Sign)
  if (payload.name) {
    formData.append('name', payload.name.trim())
  }
  formData.append('slug', payload.slug || createSlug(payload.name || payload.Sign))
  formData.append('strategies', payload.strategies || '')
  ;(payload.Roles || []).forEach(roleId => {
    formData.append('Roles', roleId)
  })
  if ((payload.Roles || []).length === 0) {
    formData.append('Roles', '')
  }
  return formData
}

export default function usePiDeafExpressions() {
  const pb = new PocketBase(config.apiBaseUrl)

  const piDeafExpressions = ref<TPiDeafExpression.TRecord[]>([])

  const loadPiDeafExpressions = async () => {
    piDeafExpressions.value = await pb
      .collection<TPiDeafExpression.TRecord>('pi_deaf_expression')
      .getFullList({
        expand: 'Sign,Roles',
        sort: 'name',
      })
  }

  const loadPiDeafExpression = async (id: string) => {
    return pb.collection<TPiDeafExpression.TRecord>('pi_deaf_expression').getOne(id, {
      expand: 'Sign,Roles',
    })
  }

  const addPiDeafExpression = async (payload: TPiDeafExpression.TForm) => {
    return pb.collection('pi_deaf_expression').create(setFormData(payload))
  }

  const updatePiDeafExpression = async (id: string, payload: TPiDeafExpression.TForm) => {
    return pb.collection('pi_deaf_expression').update(id, setFormData(payload))
  }

  const deletePiDeafExpression = async (id: string) => {
    return pb.collection('pi_deaf_expression').delete(id)
  }

  return {
    piDeafExpressions,
    loadPiDeafExpressions,
    loadPiDeafExpression,
    addPiDeafExpression,
    updatePiDeafExpression,
    deletePiDeafExpression,
  }
}
