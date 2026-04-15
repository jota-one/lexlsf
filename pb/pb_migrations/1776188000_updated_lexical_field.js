/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId('pbc_4001000001')
  unmarshal({
    listRule: "@request.auth.roles.slug ?= 'admin' || @request.auth.roles.id ?= Roles.id",
  }, collection)
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId('pbc_4001000001')
  unmarshal({
    listRule: "@request.auth.id = '' || @request.auth.roles.slug ?= 'admin' || @request.auth.roles.id ?= Roles.id",
  }, collection)
  return app.save(collection)
})
