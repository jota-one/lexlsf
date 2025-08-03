/// <reference path="../pb_data/types.d.ts" />

// Migration PocketBase - Collection hand_locations
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
        "id": "text3208210258",
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
        "id": "autodate2990389178",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085497",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "select3234567890",
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
        "id": "select3234567891",
        "maxSelect": 1,
        "name": "body_region",
        "presentable": false,
        "required": true,
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
      },
      {
        "hidden": false,
        "id": "text3234567892",
        "max": 200,
        "min": 0,
        "name": "specific_location",
        "pattern": "",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "number3234567893",
        "max": 1,
        "min": -1,
        "name": "x_position",
        "noDecimal": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "number3234567894",
        "max": 1,
        "min": -1,
        "name": "y_position",
        "noDecimal": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "number3234567895",
        "max": 1,
        "min": -1,
        "name": "z_position",
        "noDecimal": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "bool3234567896",
        "name": "contact_with_body",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "text3234567897",
        "max": 300,
        "min": 0,
        "name": "contact_details",
        "pattern": "",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "json3234567898",
        "maxSize": 800,
        "name": "location_features",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_hand_locations",
    "indexes": [],
    "listRule": null,
    "name": "hand_locations",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_hand_locations");
  return app.delete(collection);
});