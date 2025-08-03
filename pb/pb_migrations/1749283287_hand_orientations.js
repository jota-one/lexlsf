/// <reference path="../pb_data/types.d.ts" />

// Migration PocketBase - Collection hand_orientations
// Version pour PocketBase 0.27.1
// Date: 2025-08-03

migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210257",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "autodate2990389177",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085496",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "select2234567890",
        "maxSelect": 1,
        "name": "hand_type",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "dominant",
          "non_dominant"
        ]
      },
      {
        "hidden": false,
        "id": "select2234567891",
        "maxSelect": 1,
        "name": "palm_facing",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "signer",
          "addressee",
          "left",
          "right",
          "up",
          "down"
        ]
      },
      {
        "hidden": false,
        "id": "select2234567892",
        "maxSelect": 1,
        "name": "fingertips_pointing",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "up",
          "down",
          "left",
          "right",
          "forward",
          "back"
        ]
      },
      {
        "hidden": false,
        "id": "select2234567893",
        "maxSelect": 1,
        "name": "back_of_hand",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "toward_addressee",
          "toward_signer",
          "left",
          "right",
          "up",
          "down"
        ]
      },
      {
        "hidden": false,
        "id": "bool2234567894",
        "name": "web_contact",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "select2234567895",
        "maxSelect": 1,
        "name": "radial_ulnar",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "radial",
          "ulnar",
          "neutral"
        ]
      },
      {
        "hidden": false,
        "id": "json2234567896",
        "maxSize": 800,
        "name": "orientation_features",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_hand_orientations",
    "indexes": [],
    "listRule": null,
    "name": "hand_orientations",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_hand_orientations");
  return app.delete(collection);
});