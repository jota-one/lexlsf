/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId('pbc_4001000002')

  // Rename description -> note (personal note per term).
  // Reusing the same field id keeps the existing data.
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4001000027",
    "max": 0,
    "min": 0,
    "name": "note",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // Person-specific fields are not relevant for lexical terms anymore
  collection.fields.removeById('bool4001000026') // is_person
  collection.fields.removeById('text4001000029') // start_date
  collection.fields.removeById('text4001000030') // end_date
  collection.fields.removeById('relation4001000031') // Person

  // Type: single category, picked from the categories tagged "lexical_term"
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1174553048",
    "hidden": false,
    "id": "relation4001000032",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "Type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // RelatedTerms: links to other terms, across lexical fields.
  // Kept symmetric by the admin UI (both sides are written on save).
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_4001000002",
    "hidden": false,
    "id": "relation4001000033",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "RelatedTerms",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId('pbc_4001000002')

  collection.fields.removeById('relation4001000033') // RelatedTerms
  collection.fields.removeById('relation4001000032') // Type

  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool4001000026",
    "name": "is_person",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

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
})
