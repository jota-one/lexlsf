/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_63941688")

  // update field
  collection.fields.addAt(16, new Field({
    "hidden": false,
    "id": "json980656998",
    "maxSize": 0,
    "name": "timeline",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_63941688")

  // update field
  collection.fields.addAt(16, new Field({
    "hidden": false,
    "id": "json980656998",
    "maxSize": 0,
    "name": "highlights",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
