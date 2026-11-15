import { ref } from 'vue'
import { pb } from '@lib/pb'
import type { ToolReleaseResponse, ToolResponse } from '@types'

/** Slug of the sign splitter, the tool created by the tool_releases migration. */
export const SPLITTER_SLUG = 'decoupeur-de-signes'

export type ToolReleaseForm = {
  version: string
  changelog: string
  file: File
}

/**
 * A downloadable tool and its published versions. Who may see them is decided
 * by PocketBase: admins and the tool's allowed users; anyone else gets nothing.
 */
export default function useTools() {
  const tool = ref<ToolResponse | null>(null)
  const releases = ref<ToolReleaseResponse[]>([])

  /** Loads the tool, or null when it does not exist or is not shared with the user. */
  const loadTool = async (slug: string) => {
    const list = await pb.collection('tool').getList(1, 1, {
      filter: pb.filter('slug = {:slug}', { slug }),
    })
    tool.value = list.items[0] ?? null
    return tool.value
  }

  const loadReleases = async (toolId: string) => {
    releases.value = await pb.collection('tool_release').getFullList({
      filter: pb.filter('Tool = {:toolId}', { toolId }),
      sort: '-created',
    })
  }

  /**
   * The file is protected: its URL needs a file token, valid a few minutes and
   * only issued to someone the access rules let through.
   */
  const downloadUrl = async (release: ToolReleaseResponse) => {
    const token = await pb.files.getToken()
    return pb.files.getURL(release, release.file, { token, download: true })
  }

  const publishRelease = async (toolId: string, form: ToolReleaseForm) => {
    const data = new FormData()
    data.append('Tool', toolId)
    data.append('version', form.version.trim())
    data.append('changelog', form.changelog.trim())
    data.append('file', form.file)
    return pb.collection('tool_release').create(data)
  }

  const deleteRelease = async (id: string) => pb.collection('tool_release').delete(id)

  const saveAllowedUsers = async (toolId: string, userIds: string[]) => {
    tool.value = await pb.collection('tool').update(toolId, { allowed_users: userIds })
  }

  return {
    tool,
    releases,
    loadTool,
    loadReleases,
    downloadUrl,
    publishRelease,
    deleteRelease,
    saveAllowedUsers,
  }
}
