/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("fdmg5bodjwqvscz")

  // update field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_hand_configurations",
    "hidden": false,
    "id": "relation717992897",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "ConfigurationRight",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(9, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_hand_configurations",
    "hidden": false,
    "id": "relation523538799",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "ConfigurationLeft",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("fdmg5bodjwqvscz")

  // update field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_hand_configurations",
    "hidden": false,
    "id": "relation717992897",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "configuration_right",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(9, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_hand_configurations",
    "hidden": false,
    "id": "relation523538799",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "configuration_left",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
