/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2885954408")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  q.id AS id,\n  q.\"Owner\" AS Owner,\n  CAST(COALESCE(COUNT(qi.id), 0) AS INTEGER) AS items_count,\n  CAST(SUM(CASE WHEN qi.item_type = 'sign' THEN 1 ELSE 0 END) AS INTEGER) AS items_count_sign,\n  CAST(SUM(CASE WHEN qi.item_type = 'person' THEN 1 ELSE 0 END) AS INTEGER) AS items_count_person\nFROM quiz AS q\nLEFT JOIN quiz_item AS qi\n  ON qi.\"Quiz\" = q.id\nGROUP BY q.id, q.\"Owner\""
  }, collection)

  // remove field
  collection.fields.removeById("_clone_C7zC")

  // remove field
  collection.fields.removeById("json2164625113")

  // remove field
  collection.fields.removeById("json1869305380")

  // remove field
  collection.fields.removeById("json1242258405")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_1vcb",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "Owner",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number2164625113",
    "max": null,
    "min": null,
    "name": "items_count",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number1869305380",
    "max": null,
    "min": null,
    "name": "items_count_sign",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number1242258405",
    "max": null,
    "min": null,
    "name": "items_count_person",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2885954408")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  q.id AS id,\n  q.Owner AS Owner,\n  (COALESCE(COUNT(qi.id), 0)) AS items_count,\n  (SUM(CASE WHEN qi.item_type = 'sign' THEN 1 ELSE 0 END)) AS items_count_sign,\n  (SUM(CASE WHEN qi.item_type = 'person' THEN 1 ELSE 0 END)) AS items_count_person\nFROM quiz AS q\nLEFT JOIN quiz_item AS qi\n  ON qi.Quiz = q.id\nGROUP BY q.id, q.Owner"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_C7zC",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "Owner",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "json2164625113",
    "maxSize": 1,
    "name": "items_count",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "json1869305380",
    "maxSize": 1,
    "name": "items_count_sign",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "json1242258405",
    "maxSize": 1,
    "name": "items_count_person",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // remove field
  collection.fields.removeById("_clone_1vcb")

  // remove field
  collection.fields.removeById("number2164625113")

  // remove field
  collection.fields.removeById("number1869305380")

  // remove field
  collection.fields.removeById("number1242258405")

  return app.save(collection)
})
