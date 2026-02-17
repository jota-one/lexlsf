/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_63941688")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "bool1847293856",
    "name": "deceased",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "date3918475620",
    "max": "",
    "min": "",
    "name": "deathdate",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_63941688")

  // remove field
  collection.fields.removeById("bool1847293856")

  // remove field
  collection.fields.removeById("date3918475620")

  return app.save(collection)
})
