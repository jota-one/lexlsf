export function createSlug(name: string, firstname?: string): string {
  let slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace("'", '-')
  if (firstname) {
    slug = `${firstname.toLowerCase().trim().replace(/\s+/g, '-').replace("'", '-')}-${slug}`
  }
  return slug.replace(/--+/g, '-')
}
