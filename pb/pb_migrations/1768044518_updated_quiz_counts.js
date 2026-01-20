/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2885954408")

  // update collection data
  unmarshal({
    "listRule": "Owner = @request.auth.id",
    "viewRule": "Owner = @request.auth.id"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_toKv")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_C7zC",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "Owner",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2885954408")

  // update collection data
  unmarshal({
    "listRule": null,
    "viewRule": null
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_toKv",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "Owner",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("_clone_C7zC")

  return app.save(collection)
})
