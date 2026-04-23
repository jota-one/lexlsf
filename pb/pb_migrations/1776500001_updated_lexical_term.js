/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId('pbc_4001000002')

  // is_person
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool4001000026",
    "name": "is_person",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // description (markdown)
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4001000027",
    "max": 0,
    "min": 0,
    "name": "description",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // strategy
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4001000028",
    "max": 0,
    "min": 0,
    "name": "strategy",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // start_date
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4001000029",
    "max": 0,
    "min": 0,
    "name": "start_date",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // end_date
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4001000030",
    "max": 0,
    "min": 0,
    "name": "end_date",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // Person (relation to person collection)
  collection.fields.addAt(9, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_63941688",
    "hidden": false,
    "id": "relation4001000031",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "Person",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId('pbc_4001000002')
  collection.fields.removeById('bool4001000026')
  collection.fields.removeById('text4001000027')
  collection.fields.removeById('text4001000028')
  collection.fields.removeById('text4001000029')
  collection.fields.removeById('text4001000030')
  collection.fields.removeById('relation4001000031')
  return app.save(collection)
})
