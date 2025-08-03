/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("fdmg5bodjwqvscz")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "select4121173060",
    "maxSelect": 1,
    "name": "primary_language",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "LSF",
      "LSR",
      "ASL",
      "other"
    ]
  }))

  // add field
  collection.fields.addAt(11, new Field({
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
      "family",
      "media",
      "research",
      "other"
    ]
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1834118455",
    "max": 0,
    "min": 0,
    "name": "learning_source_detail",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("fdmg5bodjwqvscz")

  // remove field
  collection.fields.removeById("select4121173060")

  // remove field
  collection.fields.removeById("select2574791818")

  // remove field
  collection.fields.removeById("text1834118455")

  return app.save(collection)
})
