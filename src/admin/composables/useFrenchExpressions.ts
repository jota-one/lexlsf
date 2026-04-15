import { ref } from 'vue'
import config from '../../config'
import PocketBase from 'pocketbase'
import type { TFrenchExpression } from '../../types'
import { createSlug } from '@admin/helpers/strings'

const setFormData = (payload: TFrenchExpression.TForm) => {
  const formData = new FormData()
  formData.append('expression', payload.expression.trim())
  formData.append('slug', payload.slug || createSlug(payload.expression))
  formData.append('strategies', payload.strategies || '')
  ;(payload.Signs || []).forEach(signId => {
    formData.append('Signs', signId)
  })
  if ((payload.Signs || []).length === 0) {
    formData.append('Signs', '')
  }
  ;(payload.Roles || []).forEach(roleId => {
    formData.append('Roles', roleId)
  })
  if ((payload.Roles || []).length === 0) {
    formData.append('Roles', '')
  }
  return formData
}

export default function useFrenchExpressions() {
  const pb = new PocketBase(config.apiBaseUrl)

  const frenchExpressions = ref<TFrenchExpression.TRecord[]>([])

  const loadFrenchExpressions = async () => {
    frenchExpressions.value = await pb
      .collection<TFrenchExpression.TRecord>('french_expression')
      .getFullList({
        expand: 'Signs,Roles',
        sort: 'expression',
      })
  }

  const loadFrenchExpression = async (id: string) => {
    return pb.collection<TFrenchExpression.TRecord>('french_expression').getOne(id, {
      expand: 'Signs,Roles',
    })
  }

  const addFrenchExpression = async (payload: TFrenchExpression.TForm) => {
    return pb.collection('french_expression').create(setFormData(payload))
  }

  const updateFrenchExpression = async (id: string, payload: TFrenchExpression.TForm) => {
    return pb.collection('french_expression').update(id, setFormData(payload))
  }

  const deleteFrenchExpression = async (id: string) => {
    return pb.collection('french_expression').delete(id)
  }

  return {
    frenchExpressions,
    loadFrenchExpressions,
    loadFrenchExpression,
    addFrenchExpression,
    updateFrenchExpression,
    deleteFrenchExpression,
  }
}
