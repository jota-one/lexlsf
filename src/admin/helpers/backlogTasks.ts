// Reads the task files written by Backlog.md (backlog/tasks/*.md) so the admin
// roadmap page can be built from them. Only the parts the page shows are parsed.

export type BacklogTask = {
  id: string
  number: number
  title: string
  status: string
  labels: string[]
  priority: string
  type: string
  description: string
  acceptanceCriteria: { text: string; done: boolean }[]
}

type FrontmatterValue = string | string[]

const unquote = (value: string): string => {
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replaceAll("''", "'")
  }
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return JSON.parse(value) as string
  }
  return value
}

// Backlog.md writes a flat YAML subset: scalars, `[]`, and block lists of scalars.
export const parseFrontmatter = (block: string): Record<string, FrontmatterValue> => {
  const result: Record<string, FrontmatterValue> = {}
  let currentList: string[] | null = null

  for (const line of block.split('\n')) {
    const listItem = line.match(/^\s+-\s+(.*)$/)
    if (listItem && currentList) {
      currentList.push(unquote(listItem[1].trim()))
      continue
    }
    const entry = line.match(/^([\w-]+):\s*(.*)$/)
    if (!entry) {
      continue
    }
    const [, key, rawValue] = entry
    const value = rawValue.trim()
    if (value === '' || value === '[]') {
      currentList = []
      result[key] = currentList
    } else {
      currentList = null
      result[key] = unquote(value)
    }
  }

  return result
}

const section = (body: string, marker: string): string => {
  const match = body.match(new RegExp(`<!-- ${marker}:BEGIN -->([\\s\\S]*?)<!-- ${marker}:END -->`))
  return match ? match[1].trim() : ''
}

const asString = (value: FrontmatterValue | undefined): string =>
  typeof value === 'string' ? value : ''

const asList = (value: FrontmatterValue | undefined): string[] =>
  Array.isArray(value) ? value : []

export const parseBacklogTask = (raw: string): BacklogTask | null => {
  const match = raw.replaceAll('\r\n', '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) {
    return null
  }
  const [, frontmatterBlock, body] = match
  const fm = parseFrontmatter(frontmatterBlock)
  const id = asString(fm.id)
  if (!id) {
    return null
  }

  const acceptanceCriteria = section(body, 'AC')
    .split('\n')
    .map(line => line.match(/^- \[([ xX])\] (?:#\d+ )?(.+)$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map(m => ({ text: m[2].trim(), done: m[1] !== ' ' }))

  return {
    id,
    number: Number(id.replace(/^\D+/, '')) || 0,
    title: asString(fm.title),
    status: asString(fm.status),
    labels: asList(fm.labels),
    priority: asString(fm.priority),
    type: asString(fm.type),
    description: section(body, 'SECTION:DESCRIPTION'),
    acceptanceCriteria,
  }
}

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 }
const STATUS_RANK: Record<string, number> = { 'In Progress': 0 }

// Work in progress first, then by priority, then oldest first.
export const compareTasks = (a: BacklogTask, b: BacklogTask): number =>
  (STATUS_RANK[a.status] ?? 1) - (STATUS_RANK[b.status] ?? 1) ||
  (PRIORITY_RANK[a.priority] ?? 3) - (PRIORITY_RANK[b.priority] ?? 3) ||
  a.number - b.number

export const openTasks = (rawFiles: string[]): BacklogTask[] =>
  rawFiles
    .map(parseBacklogTask)
    .filter((task): task is BacklogTask => task !== null && task.status !== 'Done')
    .sort(compareTasks)
