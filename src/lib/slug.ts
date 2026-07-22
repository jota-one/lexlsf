export function createSlug(name: string, firstname?: string): string {
  // Build full name string (firstname + name for persons)
  let text = name.trim()
  if (firstname) {
    text = `${firstname.trim()} ${text}`
  }

  // Step 1: Normalize accented characters using String.normalize()
  // NFKD = decompose accented characters (é → e + accent)
  // Then use regex to remove combining diacritical marks
  text = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')

  // Step 2: Convert to lowercase
  text = text.toLowerCase()

  // Step 3: Replace special French characters that normalize() doesn't handle
  const specialChars: Record<string, string> = {
    œ: 'oe',
    æ: 'ae',
    ç: 'c',
  }
  for (const [char, replacement] of Object.entries(specialChars)) {
    text = text.replace(new RegExp(char, 'g'), replacement)
  }

  // Step 4: Replace spaces and special characters with hyphens
  text = text.replace(/[\s_''""`´]+/g, '-')

  // Step 5: Remove all non-alphanumeric characters except hyphens
  text = text.replace(/[^a-z0-9-]/g, '')

  // Step 6: Collapse multiple consecutive hyphens
  text = text.replace(/--+/g, '-')

  // Step 7: Remove leading/trailing hyphens
  text = text.replace(/^-+|-+$/g, '')

  return text || 'untitled' // Fallback if empty after processing
}
