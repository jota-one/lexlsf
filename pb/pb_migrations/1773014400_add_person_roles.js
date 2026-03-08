/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId('pbc_63941688')

  // Add Roles relation only if missing (handles env drift safely).
  let rolesField = null
  try {
    rolesField = collection.fields.getByName('Roles')
  } catch (_) {
    rolesField = null
  }

  if (!rolesField) {
    collection.fields.addAt(15, new Field({
      cascadeDelete: false,
      collectionId: 'pbc_2105053228',
      hidden: false,
      id: 'relation3946022848',
      maxSelect: 999,
      minSelect: 0,
      name: 'Roles',
      presentable: false,
      required: false,
      system: false,
      type: 'relation',
    }))
  }

  // Apply role-intersection visibility rules (same as signs).
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
}, (app) => {
  const collection = app.findCollectionByNameOrId('pbc_63941688')

  // Revert to open access rules.
  unmarshal(
    {
      listRule: '',
      viewRule: '',
    },
    collection,
  )

  // Remove Roles only if it exists.
  let rolesField = null
  try {
    rolesField = collection.fields.getByName('Roles')
  } catch (_) {
    rolesField = null
  }

  if (rolesField) {
    collection.fields.removeById(rolesField.id)
  }

  return app.save(collection)
})
