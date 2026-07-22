export const translateNumericLevel = (level: number) => {
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1']
  return levels[level - 1] || ''
}

export const getNumericLevel = (level: string) => {
  return ['a1', 'a2', 'b1', 'b2', 'c1'].indexOf(level) + 1
}

export const learningSourceOptions = [
  { label: 'Dictionnaire', value: 'dictionary' },
  { label: 'Enseignant', value: 'teacher' },
  { label: 'Communauté', value: 'community' },
  { label: 'Média', value: 'media' },
  { label: 'Autre', value: 'other' },
]

export const primaryLanguageOptions = [
  { label: 'LSF', value: 'LSF' },
  { label: 'LSR', value: 'LSR' },
  { label: 'ASL', value: 'ASL' },
  { label: 'LSI', value: 'LSI' },
  { label: 'BSL', value: 'BSL' },
  { label: 'ISL', value: 'ISL' },
  { label: 'Autre', value: 'other' },
]

export const verificationStatusOptions = [
  { label: 'À vérifier', value: 'unverified' },
  { label: 'Officiel', value: 'verified' },
  { label: 'Contesté', value: 'disputed' },
]
