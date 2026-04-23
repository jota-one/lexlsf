// Entity definitions used across admin forms and filters
export const ENTITY_OPTIONS = [
  { id: 'person', label: 'Personnes', disabled: false },
  { id: 'activity', label: 'Activités', disabled: false },
  { id: 'lexical_field', label: 'Champs lexicaux', disabled: false },
]

export const ALL_ENTITIES = [{ id: 'sign', label: 'Signes', disabled: true }, ...ENTITY_OPTIONS]
