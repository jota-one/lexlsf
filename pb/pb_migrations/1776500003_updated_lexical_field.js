/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId('pbc_4001000001')

  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1174553048",
    "hidden": false,
    "id": "relation4001000017",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "Categories",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId('pbc_4001000001')
  collection.fields.removeById('relation4001000017')
  return app.save(collection)
})
