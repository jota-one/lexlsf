import type { ItemType } from '../types/quiz'

export type QuizModeFieldType = 'text' | 'video' | 'file' | 'relation'

export type QuizModeField = {
  key: string
  type: QuizModeFieldType
  label?: string
}

export type QuizMode = {
  key: string
  label: string
  description: string
  itemType: Exclude<ItemType, 'mixed'>
  faceA: QuizModeField[]
  faceB: QuizModeField[]
}

export const QUIZ_MODES: QuizMode[] = [
  {
    key: 'sign_video_to_term',
    label: 'Vidéo → Terme',
    description: 'Affiche la vidéo du signe, devinez le terme',
    itemType: 'sign',
    faceA: [
      { key: 'video', type: 'video', label: 'Vidéo' }
    ],
    faceB: [
      { key: 'name', type: 'text', label: 'Terme' },
      { key: 'Category', type: 'relation', label: 'Catégorie' },
      { key: 'ConfigurationLeft', type: 'relation', label: 'Configuration gauche' },
      { key: 'ConfigurationRight', type: 'relation', label: 'Configuration droite' },
      { key: 'definition', type: 'text', label: 'Définition' }
    ]
  },
  {
    key: 'sign_term_to_video',
    label: 'Terme → Vidéo + détails',
    description: 'Affiche le terme, visualisez le signe et ses détails',
    itemType: 'sign',
    faceA: [
      { key: 'name', type: 'text', label: 'Terme' }
    ],
    faceB: [
      { key: 'video', type: 'video', label: 'Vidéo' },
      { key: 'Category', type: 'relation', label: 'Catégorie' },
      { key: 'ConfigurationLeft', type: 'relation', label: 'Configuration gauche' },
      { key: 'definition', type: 'text', label: 'Définition' }
    ]
  },
  {
    key: 'person_illustration_to_name',
    label: 'Photo → Nom',
    description: 'Affiche la photo, devinez le nom de la personne/organisme',
    itemType: 'person',
    faceA: [
      { key: 'illustration', type: 'file', label: 'Photo' }
    ],
    faceB: [
      { key: 'name', type: 'text', label: 'Nom' },
      { key: 'firstname', type: 'text', label: 'Prénom' },
      { key: 'Category', type: 'relation', label: 'Catégorie' }
    ]
  },
  {
    key: 'person_name_to_details',
    label: 'Nom → Détails',
    description: 'Affiche le nom, visualisez les détails de la personne/organisme',
    itemType: 'person',
    faceA: [
      { key: 'name', type: 'text', label: 'Nom' }
    ],
    faceB: [
      { key: 'illustration', type: 'file', label: 'Photo' },
      { key: 'firstname', type: 'text', label: 'Prénom' },
      { key: 'Category', type: 'relation', label: 'Catégorie' }
    ]
  }
]

export function getQuizModes(itemType?: Exclude<ItemType, 'mixed'>): QuizMode[] {
  if (!itemType) return QUIZ_MODES
  return QUIZ_MODES.filter(mode => mode.itemType === itemType)
}

export function getQuizMode(key: string): QuizMode | undefined {
  return QUIZ_MODES.find(mode => mode.key === key)
}
