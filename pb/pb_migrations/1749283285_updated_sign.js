/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("fdmg5bodjwqvscz")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "select2599078931",
    "maxSelect": 1,
    "name": "level",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "a1",
      "a2",
      "b1",
      "b2",
      "c1"
    ]
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "select2783094231",
    "maxSelect": 1,
    "name": "configuration",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "corps",
      "tete"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("fdmg5bodjwqvscz")

  // remove field
  collection.fields.removeById("select2599078931")

  // remove field
  collection.fields.removeById("select2783094231")

  return app.save(collection)
})
