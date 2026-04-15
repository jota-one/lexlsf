/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId('pbc_4001000001')
  unmarshal({
    createRule: "@request.auth.id != '' && @request.auth.roles.slug ?= 'admin'",
    updateRule: "@request.auth.id != '' && @request.auth.roles.slug ?= 'admin'",
    deleteRule: "@request.auth.id != '' && @request.auth.roles.slug ?= 'admin'",
  }, collection)
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId('pbc_4001000001')
  unmarshal({ createRule: null, updateRule: null, deleteRule: null }, collection)
  return app.save(collection)
})
