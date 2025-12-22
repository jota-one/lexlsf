/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1174553048")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select1357669605",
    "maxSelect": 2,
    "name": "entities",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "person",
      "activity"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1174553048")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select1357669605",
    "maxSelect": 1,
    "name": "entities",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "person"
    ]
  }))

  return app.save(collection)
})
