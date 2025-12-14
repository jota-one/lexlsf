import { ref } from 'vue'
import config from '../../../config'
import PocketBase from 'pocketbase'
import type { TPerson } from '../../../types'

const setFormData = (payload: TPerson.TForm) => {
  const formData = new FormData()
  // set regular text field
  if (payload.illustration && payload.illustration instanceof File) {
    formData.append('illustration', payload.illustration)
  }
  formData.append('name', payload.name)
  formData.append('slug', payload.name.toLowerCase().replace(/\s+/g, '-'))
  if (payload.description) {
    formData.append('description', payload.description)
  }
  if (payload.Sign) {
    formData.append('Sign', payload.Sign)
  }
  ;(payload.Category || []).forEach(cat => {
    formData.append('Category', cat)
  })

  return formData
}

export default function usePersons() {
  const pb = new PocketBase(config.apiBaseUrl)

  const persons = ref<TPerson.TRecord[]>([])
  const loadPersons = async (category: string) => {
    persons.value = await pb.collection<TPerson.TRecord>('person').getFullList({
      fields: 'id, name, illustration, slug, updated, expand.Category.*, expand.Sign.*',
      expand: 'Category,Sign',
      filter: `Category.slug ?= "${category}"`,
      sort: '-updated',
    })
  }

  const loadPerson = async (id: string) => {
    return pb.collection<TPerson.TRecord & { expand?: any }>('person').getOne(id, {
      fields: '*',
      expand: 'Category,Sign',
    })
  }

  const addPerson = async (payload: TPerson.TForm) => {
    const formData = setFormData(payload)

    // upload and create new record
    return pb.collection('person').create(formData)
  }

  const updatePerson = async (id: string, payload: TPerson.TForm) => {
    const formData = setFormData(payload)

    // upload and update record
    return pb.collection('person').update(id, formData)
  }

  const deletePerson = async (id: string) => {
    return pb.collection('person').delete(id)
  }

  const getIllustrationUrl = (person: TPerson.TRecord): string => {
    if (!person.illustration) return ''
    return `${config.apiBaseUrl}/api/files/person/${person.id}/${person.illustration}`
  }

  return {
    persons,
    loadPersons,
    loadPerson,
    addPerson,
    deletePerson,
    updatePerson,
    getIllustrationUrl,
  }
}
