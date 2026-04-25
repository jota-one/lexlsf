/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId('general_culture')

  Object.assign(collection, {
    "createRule": "@request.auth.roles.slug ?= 'admin'",
    "updateRule": "@request.auth.roles.slug ?= 'admin'",
    "deleteRule": "@request.auth.roles.slug ?= 'admin'"
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId('general_culture')

  Object.assign(collection, {
    "createRule": null,
    "updateRule": null,
    "deleteRule": null
  })

  return app.save(collection)
})
