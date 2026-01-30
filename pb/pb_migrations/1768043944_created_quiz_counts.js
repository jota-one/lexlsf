/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 0,
        "min": 0,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "_clone_toKv",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "Owner",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "json2164625113",
        "maxSize": 1,
        "name": "items_count",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json1869305380",
        "maxSize": 1,
        "name": "items_count_sign",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json1242258405",
        "maxSize": 1,
        "name": "items_count_person",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_2885954408",
    "indexes": [],
    "listRule": null,
    "name": "quiz_counts",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT\n  q.id AS id,\n  q.Owner AS Owner,\n  (COALESCE(COUNT(qi.id), 0)) AS items_count,\n  (SUM(CASE WHEN qi.item_type = 'sign' THEN 1 ELSE 0 END)) AS items_count_sign,\n  (SUM(CASE WHEN qi.item_type = 'person' THEN 1 ELSE 0 END)) AS items_count_person\nFROM quiz AS q\nLEFT JOIN quiz_item AS qi\n  ON qi.Quiz = q.id\nGROUP BY q.id, q.Owner",
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2885954408");

  return app.delete(collection);
})
