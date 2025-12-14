import config from '../../config'
import PocketBase from 'pocketbase'
import type { TVideo } from '../../types'

export default function useVideos() {
  const pb = new PocketBase(config.apiBaseUrl)

  const addVideo = async (payload: TVideo.TForm) => {
    return pb.collection<TVideo.TRecord>('video').create(payload)
  }

  const updateVideo = async (id: string, payload: TVideo.TForm) => {
    return pb.collection<TVideo.TRecord>('video').update(id, payload)
  }

  const findVideoByUrl = async (url: string) => {
    try {
      return await pb.collection<TVideo.TRecord>('video').getFirstListItem(`url="${url}"`)
    } catch {
      return null
    }
  }

  const deleteVideo = async (id: string) => {
    return pb.collection('video').delete(id)
  }

  return {
    addVideo,
    updateVideo,
    deleteVideo,
    findVideoByUrl,
  }
}
