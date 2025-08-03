/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_hand_configurations")

  // remove field
  collection.fields.removeById("select1234567890")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_hand_configurations")

  // add field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "select1234567890",
    "maxSelect": 1,
    "name": "hand_type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "dominant",
      "non_dominant"
    ]
  }))

  return app.save(collection)
})
