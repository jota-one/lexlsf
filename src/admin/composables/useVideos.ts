import { pb } from '@lib/pb'
import type { TVideo } from '../../types'

export default function useVideos() {

  const addVideo = async (payload: TVideo.TForm) => {
    return pb.collection<TVideo.TRecord>('video').create(payload)
  }

  const updateVideo = async (id: string, payload: TVideo.TForm) => {
    return pb.collection<TVideo.TRecord>('video').update(id, payload)
  }

  const findVideoByUrl = async (url: string) => {
    try {
      return await pb
        .collection<TVideo.TRecord>('video')
        .getFirstListItem(pb.filter('url = {:url}', { url }))
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
