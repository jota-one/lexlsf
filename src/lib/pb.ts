import PocketBase from 'pocketbase'
import config from '@config'

export const pb = new PocketBase(config.apiBaseUrl)
pb.autoCancellation(false)

export const fileUrl = (record: { [k: string]: any }, filename: string) => {
  if (!filename) {
    return ''
  }
  return pb.files.getURL(record, filename)
}
