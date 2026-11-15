/// <reference path="../pb_data/types.d.ts" />

// Downloadable tools (the sign splitter first) and their published versions.
// The people allowed to download a tool are kept once, on the tool; each
// version carries its changelog and a protected file, served only to admins and
// to those people, through a short-lived file token.

const ADMIN = "@request.auth.roles.slug ?= 'admin'"
// Signed in first: for a visitor @request.auth.id is empty, and PocketBase
// takes an empty allowed_users as matching it.
const SIGNED_IN = "@request.auth.id != ''"
const TOOL_RULE = `${SIGNED_IN} && (${ADMIN} || allowed_users.id ?= @request.auth.id)`
const RELEASE_RULE = `${SIGNED_IN} && (${ADMIN} || Tool.allowed_users.id ?= @request.auth.id)`

migrate(
  app => {
    const users = app.findCollectionByNameOrId('users')

    const tool = new Collection({
      type: 'base',
      name: 'tool',
      listRule: TOOL_RULE,
      viewRule: TOOL_RULE,
      createRule: ADMIN,
      updateRule: ADMIN,
      deleteRule: ADMIN,
      fields: [
        { name: 'name', type: 'text', required: true, max: 200 },
        { name: 'slug', type: 'text', required: true, max: 200 },
        { name: 'description', type: 'text', max: 2000 },
        {
          name: 'allowed_users',
          type: 'relation',
          collectionId: users.id,
          maxSelect: 999,
          cascadeDelete: false,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX `idx_tool_slug` ON `tool` (`slug`)'],
    })
    app.save(tool)

    const release = new Collection({
      type: 'base',
      name: 'tool_release',
      listRule: RELEASE_RULE,
      viewRule: RELEASE_RULE,
      createRule: ADMIN,
      updateRule: ADMIN,
      deleteRule: ADMIN,
      fields: [
        {
          name: 'Tool',
          type: 'relation',
          collectionId: tool.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'version', type: 'text', required: true, max: 50 },
        { name: 'changelog', type: 'text', max: 10000 },
        {
          name: 'file',
          type: 'file',
          required: true,
          maxSelect: 1,
          maxSize: 200 * 1024 * 1024,
          protected: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(release)

    const splitter = new Record(tool)
    splitter.set('name', 'Découpeur de signes')
    splitter.set('slug', 'decoupeur-de-signes')
    splitter.set(
      'description',
      'Outil local qui découpe une vidéo où plusieurs signes se suivent en un clip par signe.',
    )
    app.save(splitter)
  },
  app => {
    app.delete(app.findCollectionByNameOrId('tool_release'))
    app.delete(app.findCollectionByNameOrId('tool'))
  },
)
