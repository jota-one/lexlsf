import { ref } from 'vue'
import { pb } from '@lib/pb'

export default function useHandMovements() {
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
