import { computed, ref } from 'vue'

const translations: any = {
  head: 'Tête',
  face: 'Visage',
  neck: 'Cou',
  torso: 'Torse',
  arms: 'Bras',
  hands: 'Mains',
  neutral_space: 'Espace neutre',
}

export default function useHandLocations() {
  const handLocations = ref(['head', 'face', 'neck', 'torso', 'arms', 'hands', 'neutral_space'])

  const handLocationOptions = computed(() =>
    handLocations.value.map(location => ({
      label: translations[location],
      value: location,
    })),
  )

  return {
    handLocations,
    handLocationOptions,
  }
}
