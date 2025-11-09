/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3094607438")

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "json1222341902",
    "maxSize": 0,
    "name": "placement",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3094607438")

  // remove field
  collection.fields.removeById("json1222341902")

  return app.save(collection)
})
