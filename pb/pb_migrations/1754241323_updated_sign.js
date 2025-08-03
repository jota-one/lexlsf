/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("fdmg5bodjwqvscz")

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "select284544841",
    "maxSelect": 1,
    "name": "verification_status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "verified",
      "unverified",
      "disputed"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("fdmg5bodjwqvscz")

  // remove field
  collection.fields.removeById("select284544841")

  return app.save(collection)
})
