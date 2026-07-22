import { ref } from 'vue'
import { pb } from '@lib/pb'

export interface TRole {
  id: string
  name: string
  slug: string
  created: string
  updated: string
}

export default function useRoles() {

  const roles = ref<TRole[]>([])

  const loadRoles = async () => {
    roles.value = await pb.collection('roles').getFullList<TRole>({
      sort: 'name',
    })
  }

  return {
    roles,
    loadRoles,
  }
}
