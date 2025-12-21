/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_63941688")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool223578668",
    "name": "organism",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_63941688")

  // remove field
  collection.fields.removeById("bool223578668")

  return app.save(collection)
})
