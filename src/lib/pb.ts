import PocketBase from 'pocketbase'
import config from '@config'

export const pb = new PocketBase(config.apiBaseUrl)
pb.autoCancellation(false)

// PB record ids are alphanumeric; drop anything else before joining into a filter
export const idFilter = (ids: string[]) =>
  ids
    .filter(id => /^[a-z0-9]+$/i.test(id))
    .map(id => `id = "${id}"`)
    .join(' || ')

export const fileUrl = (record: { [k: string]: any }, filename: string) => {
  if (!filename) {
    return ''
  }
  return pb.files.getURL(record, filename)
}
