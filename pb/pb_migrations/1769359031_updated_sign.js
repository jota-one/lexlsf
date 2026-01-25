/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3094607438")

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "select2574791818",
    "maxSelect": 1,
    "name": "learning_source",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "dictionary",
      "teacher",
      "community",
      "media",
      "other",
      "uni/m1"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3094607438")

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "select2574791818",
    "maxSelect": 1,
    "name": "learning_source",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "dictionary",
      "teacher",
      "community",
      "media",
      "other"
    ]
  }))

  return app.save(collection)
})
