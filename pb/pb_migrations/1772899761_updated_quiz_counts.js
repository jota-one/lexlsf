/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2885954408")

  // update collection data
  unmarshal({
    "listRule": "Owner = @request.auth.id || shared_with_users.id ?=\n  @request.auth.id",
    "viewRule": "Owner = @request.auth.id || shared_with_users.id ?=\n  @request.auth.id"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_Xxzz")

  // remove field
  collection.fields.removeById("_clone_jKdh")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_1IRJ",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "Owner",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_AWK1",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "shared_with_users",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2885954408")

  // update collection data
  unmarshal({
    "listRule": "Owner = @request.auth.id",
    "viewRule": "Owner = @request.auth.id"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_Xxzz",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "Owner",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_jKdh",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "shared_with_users",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("_clone_1IRJ")

  // remove field
  collection.fields.removeById("_clone_AWK1")

  return app.save(collection)
})
