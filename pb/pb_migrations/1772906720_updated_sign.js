/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3094607438")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id = '' || \n  @request.auth.roles.slug ?= 'admin' || @request.auth.roles.id ?= Roles.id",
    "viewRule": "@request.auth.id = '' || \n  @request.auth.roles.slug ?= 'admin' || @request.auth.roles.id ?= Roles.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3094607438")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id = '' || (\n  @request.auth.roles.slug ?= 'admin' ||\n  (@request.auth.roles.slug ?= 'student' && level = 'c1')\n)",
    "viewRule": "@request.auth.id = '' || (\n  @request.auth.roles.slug ?= 'admin' ||\n  (@request.auth.roles.slug ?= 'student' && level = 'c1')\n)"
  }, collection)

  return app.save(collection)
})
