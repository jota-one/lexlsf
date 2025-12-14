import { ref } from 'vue'
import config from '../../config'
import PocketBase from 'pocketbase'

export default function useHandMovements() {
  const pb = new PocketBase(config.apiBaseUrl)
  const handMovements = ref([])
  const loadingHandMovements = ref(false)

  const loadHandMovements = async () => {
    loadingHandMovements.value = true
    handMovements.value = await pb.collection('hand_movements').getFullList({
      fields: 'id,hand_type,direction',
    })
    loadingHandMovements.value = false
  }

  return {
    handMovements,
    loadingHandMovements,
    loadHandMovements,
  }
}
