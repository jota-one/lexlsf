/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("fdmg5bodjwqvscz")

  // remove field
  collection.fields.removeById("select2783094231")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "select3264622641",
    "maxSelect": 1,
    "name": "location_right",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "head",
      "face",
      "neck",
      "torso",
      "arms",
      "hands",
      "neutral_space"
    ]
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "select4200813096",
    "maxSelect": 1,
    "name": "location_left",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "head",
      "face",
      "neck",
      "torso",
      "arms",
      "hands",
      "neutral_space"
    ]
  }))

  // add field
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

  // add field
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("fdmg5bodjwqvscz")

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

  // remove field
  collection.fields.removeById("select3264622641")

  // remove field
  collection.fields.removeById("select4200813096")

  // remove field
  collection.fields.removeById("relation717992897")

  // remove field
  collection.fields.removeById("relation523538799")

  return app.save(collection)
})
