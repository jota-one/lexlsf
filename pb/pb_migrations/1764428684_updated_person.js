/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_63941688")

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3094607438",
    "hidden": false,
    "id": "relation1061961408",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "Sign",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_63941688")

  // remove field
  collection.fields.removeById("relation1061961408")

  return app.save(collection)
})
