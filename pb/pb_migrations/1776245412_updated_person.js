/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId('pbc_63941688')

  // Remove anonymous access — all pages are now client:only SPAs
  // that load data through useAuth().pb (JWT in sessionStorage).
  unmarshal(
    {
      listRule: "@request.auth.roles.slug ?= 'admin' || @request.auth.roles.id ?= Roles.id",
      viewRule: "@request.auth.roles.slug ?= 'admin' || @request.auth.roles.id ?= Roles.id",
    },
    collection,
  )

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId('pbc_63941688')

  unmarshal(
    {
      listRule:
        "@request.auth.id = '' || \n  @request.auth.roles.slug ?= 'admin' || @request.auth.roles.id ?= Roles.id",
      viewRule:
        "@request.auth.id = '' || \n  @request.auth.roles.slug ?= 'admin' || @request.auth.roles.id ?= Roles.id",
    },
    collection,
  )

  return app.save(collection)
})
