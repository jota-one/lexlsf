/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_63941688")

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3078710471",
    "hidden": false,
    "id": "relation772169988",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "Videos",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_63941688")

  // remove field
  collection.fields.removeById("relation772169988")

  return app.save(collection)
})
