/** Label of a quiz item type, as shown on badges. */
export const itemTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    sign: 'Signes',
    person: 'Personnes',
    mixed: 'Mixte',
  }
  return labels[type] || type
}

/**
 * Badge colour of a quiz item type: signs are blue, the colour of the Deaf, and
 * persons take the Culture pink. A mixed quiz stays neutral.
 */
export const itemTypeBadge = (type: string): string => {
  const classes: Record<string, string> = {
    sign: 'badge-primary',
    person: 'badge-secondary',
  }
  return classes[type] ?? 'badge-ghost'
}
