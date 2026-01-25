/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3094607438")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != '' && @request.auth.roles.slug ?= 'admin'",
    "deleteRule": "@request.auth.id != '' && @request.auth.roles.slug ?= 'admin'",
    "updateRule": "@request.auth.id != '' && @request.auth.roles.slug ?= 'admin'",
    "listRule": "@request.auth.id != '' && (\n  @request.auth.roles.slug ?= 'admin' ||\n  (@request.auth.roles.slug ?= 'student' && learning_source = 'uni/m1')\n)",
    "viewRule": "@request.auth.id != '' && (\n  @request.auth.roles.slug ?= 'admin' ||\n  (@request.auth.roles.slug ?= 'student' && learning_source = 'uni/m1')\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3094607438")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": "",
    "listRule": "",
    "updateRule": "",
    "viewRule": ""
  }, collection)

  return app.save(collection)
})
