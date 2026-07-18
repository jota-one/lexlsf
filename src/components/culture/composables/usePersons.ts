import { ref } from 'vue'
import useAuth from '@admin/composables/useAuth'
import { fileUrl } from '@lib/pb'
import type { TPerson } from '../../../types'

export default function usePersons() {
  const { pb } = useAuth()

  const persons = ref<TPerson.TRecord[]>([])
  const loadPersons = async (category: string) => {
    persons.value = await pb.collection<TPerson.TRecord>('person').getFullList({
      fields:
        'id, name, firstname, organism, illustration, slug, updated, expand.Category.*, expand.Sign.*',
      expand: 'Category,Sign',
      filter: `Category.slug ?= "${category}"`,
      sort: 'name,firstname',
    })
  }

  const loadPerson = async (id: string) => {
    return pb.collection<TPerson.TRecord & { expand?: any }>('person').getOne(id, {
      fields: '*',
      expand: 'Category,Sign',
    })
  }

  const getIllustrationUrl = (person: TPerson.TRecord): string => {
    return fileUrl(person, person.illustration)
  }

  return {
    persons,
    loadPersons,
    loadPerson,
    getIllustrationUrl,
  }
}
