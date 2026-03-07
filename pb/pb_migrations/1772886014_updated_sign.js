/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3094607438")

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "select4121173060",
    "maxSelect": 1,
    "name": "primary_language",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "LSF",
      "LSR",
      "ASL",
      "LSI",
      "BSL",
      "ISL",
      "other"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3094607438")

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "select4121173060",
    "maxSelect": 1,
    "name": "primary_language",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "LSF",
      "LSR",
      "ASL",
      "LS Internationale",
      "BSL",
      "ISL",
      "other"
    ]
  }))

  return app.save(collection)
})
