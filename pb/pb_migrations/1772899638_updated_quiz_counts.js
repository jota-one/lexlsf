/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2885954408")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n     q.id AS id,\n     q.\"Owner\" AS Owner,\n     q.shared_with_users,\n     CAST(COALESCE(COUNT(qi.id), 0) AS INTEGER) AS items_count,\n     CAST(SUM(CASE WHEN qi.item_type = 'sign' THEN 1 ELSE 0 END) AS INTEGER) AS items_count_sign,\n     CAST(SUM(CASE WHEN qi.item_type = 'person' THEN 1 ELSE 0 END) AS INTEGER) AS items_count_person\n   FROM quiz AS q\n   LEFT JOIN quiz_item AS qi\n     ON qi.\"Quiz\" = q.id\n   GROUP BY q.id, q.\"Owner\", q.shared_with_users"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_1vcb")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_Xxzz",
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
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_jKdh",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "shared_with_users",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2885954408")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  q.id AS id,\n  q.\"Owner\" AS Owner,\n  CAST(COALESCE(COUNT(qi.id), 0) AS INTEGER) AS items_count,\n  CAST(SUM(CASE WHEN qi.item_type = 'sign' THEN 1 ELSE 0 END) AS INTEGER) AS items_count_sign,\n  CAST(SUM(CASE WHEN qi.item_type = 'person' THEN 1 ELSE 0 END) AS INTEGER) AS items_count_person\nFROM quiz AS q\nLEFT JOIN quiz_item AS qi\n  ON qi.\"Quiz\" = q.id\nGROUP BY q.id, q.\"Owner\""
  }, collection)

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

  // remove field
  collection.fields.removeById("_clone_Xxzz")

  // remove field
  collection.fields.removeById("_clone_jKdh")

  return app.save(collection)
})
