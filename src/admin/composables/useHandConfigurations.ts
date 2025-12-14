import { ref } from 'vue'
import config from '../../config'
import PocketBase from 'pocketbase'

export default function useHandConfigurations() {
  const pb = new PocketBase(config.apiBaseUrl)
  const handConfigurations = ref([])
  const loadingHandConfigurations = ref(false)

  const loadHandConfigurations = async (sort = '-created') => {
    loadingHandConfigurations.value = true
    handConfigurations.value = await pb.collection('hand_configurations').getFullList({
      fields: 'id,name,illustration',
      sort,
    })
    loadingHandConfigurations.value = false
  }

  const loadHandConfiguration = async (id: string) => {
    return pb.collection('hand_configurations').getOne(id, {
      fields: 'id,name,illustration',
    })
  }

  const addHandConfiguration = async (payload: any) => {
    loadingHandConfigurations.value = true
    const formData = new FormData()

    // set regular text field
    formData.append('name', payload.name)
    formData.append('illustration', payload.illustration)

    // upload and create new record
    return pb.collection('hand_configurations').create(formData)
  }

  const updateHandConfiguration = async (id: string, payload: any) => {
    loadingHandConfigurations.value = true
    const formData = new FormData()

    // set regular text field
    formData.append('name', payload.name)
    if (payload.illustration) {
      formData.append('illustration', payload.illustration)
    }

    // upload and update record
    return pb.collection('hand_configurations').update(id, formData)
  }

  const deleteHandConfiguration = async (id: string) => {
    return pb.collection('hand_configurations').delete(id)
  }

  const getIllustrationUrl = (filename: string, id: string) => {
    // Remplacez ceci par la logique réelle pour générer l'URL de l'image
    // Par exemple, si PocketBase: `/api/files/hand_configurations/${id}/${filename}`
    return filename ? `${config.apiBaseUrl}/api/files/hand_configurations/${id}/${filename}` : ''
  }

  return {
    addHandConfiguration,
    getIllustrationUrl,
    handConfigurations,
    loadHandConfiguration,
    loadingHandConfigurations,
    loadHandConfigurations,
    updateHandConfiguration,
    deleteHandConfiguration,
  }
}
