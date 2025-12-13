/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_63941688")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool53159944",
    "name": "deaf",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "date2464439331",
    "max": "",
    "min": "",
    "name": "birthdate",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1720893686",
    "max": 0,
    "min": 0,
    "name": "birthplace",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "bool3403502755",
    "name": "deafFamily",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2783322459",
    "max": 0,
    "min": 0,
    "name": "family",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1174553048",
    "hidden": false,
    "id": "relation4205620277",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "Activities",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "json3911327287",
    "maxSize": 0,
    "name": "rewards",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_63941688")

  // remove field
  collection.fields.removeById("bool53159944")

  // remove field
  collection.fields.removeById("date2464439331")

  // remove field
  collection.fields.removeById("text1720893686")

  // remove field
  collection.fields.removeById("bool3403502755")

  // remove field
  collection.fields.removeById("text2783322459")

  // remove field
  collection.fields.removeById("relation4205620277")

  // remove field
  collection.fields.removeById("json3911327287")

  return app.save(collection)
})
