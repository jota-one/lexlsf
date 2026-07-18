export function formatDate(raw: string): string {
  if (!raw) return ''
  const parts = raw.split('-')
  const months = [
    'jan.',
    'fév.',
    'mar.',
    'avr.',
    'mai',
    'jun.',
    'jul.',
    'aoû.',
    'sep.',
    'oct.',
    'nov.',
    'déc.',
  ]
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${months[parseInt(parts[1]) - 1]} ${parts[0]}`
  return `${parseInt(parts[2])} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`
}

export function formatDateRange(start: string, end: string): string {
  if (!end) return formatDate(start)
  return `${formatDate(start)} → ${formatDate(end)}`
}

export function isPeriod(item: { end_date?: string }): boolean {
  return !!item.end_date
}
