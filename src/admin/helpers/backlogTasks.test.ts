import { describe, it, expect } from 'vitest'
import { parseFrontmatter, parseBacklogTask, openTasks } from './backlogTasks'

const taskFile = (frontmatter: string, body = '') => `---\n${frontmatter}\n---\n${body}`

const fullTask = taskFile(
  `id: TASK-12
title: 'Découpeur de signes : des clips prêts pour l''upload'
status: To Do
assignee: []
labels:
  - outils
  - video
dependencies: []
priority: high
type: enhancement`,
  `
## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Premier paragraphe.

Second paragraphe.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Le code est versionné
- [x] #2 Un zip est livré
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Not for the roadmap page.
<!-- SECTION:NOTES:END -->
`,
)

describe('parseFrontmatter', () => {
  it('reads scalars, empty lists and block lists', () => {
    expect(parseFrontmatter('id: TASK-1\nassignee: []\nlabels:\n  - quiz\n  - admin')).toEqual({
      id: 'TASK-1',
      assignee: [],
      labels: ['quiz', 'admin'],
    })
  })

  it('unquotes single and double quoted values', () => {
    expect(parseFrontmatter(`a: 'l''upload'\nb: "x: y"\nc: '2026-11-13T07:49:00Z'`)).toEqual({
      a: "l'upload",
      b: 'x: y',
      c: '2026-11-13T07:49:00Z',
    })
  })
})

describe('parseBacklogTask', () => {
  it('reads the fields the roadmap page shows', () => {
    expect(parseBacklogTask(fullTask)).toEqual({
      id: 'TASK-12',
      number: 12,
      title: "Découpeur de signes : des clips prêts pour l'upload",
      status: 'To Do',
      labels: ['outils', 'video'],
      priority: 'high',
      type: 'enhancement',
      description: 'Premier paragraphe.\n\nSecond paragraphe.',
      acceptanceCriteria: [
        { text: 'Le code est versionné', done: false },
        { text: 'Un zip est livré', done: true },
      ],
    })
  })

  it('tolerates a task without description or criteria', () => {
    const task = parseBacklogTask(taskFile('id: TASK-3\ntitle: Court\nstatus: To Do'))
    expect(task?.description).toBe('')
    expect(task?.acceptanceCriteria).toEqual([])
    expect(task?.labels).toEqual([])
  })

  it('rejects a file without frontmatter or id', () => {
    expect(parseBacklogTask('# Just markdown')).toBeNull()
    expect(parseBacklogTask(taskFile('title: No id'))).toBeNull()
  })
})

describe('openTasks', () => {
  const task = (id: number, status: string, priority = '') =>
    taskFile(
      `id: TASK-${id}\ntitle: T${id}\nstatus: ${status}${priority ? `\npriority: ${priority}` : ''}`,
    )

  it('drops done tasks and sorts in progress, then priority, then oldest', () => {
    const files = [
      task(1, 'To Do'),
      task(2, 'Done', 'high'),
      task(3, 'To Do', 'low'),
      task(4, 'To Do', 'high'),
      task(5, 'In Progress', 'low'),
      task(6, 'To Do', 'high'),
    ]
    expect(openTasks(files).map(t => t.number)).toEqual([5, 4, 6, 3, 1])
  })
})
