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
    faceA: [{ key: 'video', type: 'video', label: 'Vidéo' }],
    faceB: [{ key: 'name', type: 'text', label: 'Terme' }],
  },
  {
    key: 'sign_term_to_video',
    label: 'Terme → Vidéo',
    description: 'Affiche le terme, visualisez la vidéo du signe',
    itemType: 'sign',
    faceA: [{ key: 'name', type: 'text', label: 'Terme' }],
    faceB: [{ key: 'video', type: 'video', label: 'Vidéo' }],
  },
  {
    key: 'person_illustration_to_name',
    label: 'Photo → Nom',
    description: 'Affiche la photo, devinez le nom de la personne/organisme',
    itemType: 'person',
    faceA: [{ key: 'illustration', type: 'file', label: 'Photo' }],
    faceB: [
      { key: 'name', type: 'text', label: 'Nom' },
      { key: 'firstname', type: 'text', label: 'Prénom' },
    ],
  },
  {
    key: 'person_name_to_details',
    label: 'Nom → Photo',
    description: 'Affiche le nom, retrouvez la photo de la personne/organisme',
    itemType: 'person',
    faceA: [{ key: 'name', type: 'text', label: 'Nom' }],
    faceB: [{ key: 'illustration', type: 'file', label: 'Photo' }],
  },
]

export function getQuizModes(itemType?: Exclude<ItemType, 'mixed'>): QuizMode[] {
  if (!itemType) return QUIZ_MODES
  return QUIZ_MODES.filter(mode => mode.itemType === itemType)
}

export function getQuizMode(key: string): QuizMode | undefined {
  return QUIZ_MODES.find(mode => mode.key === key)
}
