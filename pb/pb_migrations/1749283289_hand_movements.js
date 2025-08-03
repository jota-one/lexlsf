/// <reference path="../pb_data/types.d.ts" />

// Migration PocketBase - Collection hand_movements
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
        "id": "text3208210259",
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
        "id": "autodate2990389179",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085498",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "select4234567890",
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
        "id": "bool4234567891",
        "name": "path_movement_present",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "select4234567892",
        "maxSelect": 1,
        "name": "direction",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "horizontal",
          "vertical",
          "circular",
          "zigzag",
          "arc",
          "diagonal"
        ]
      },
      {
        "hidden": false,
        "id": "select4234567893",
        "maxSelect": 1,
        "name": "trajectory",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "straight",
          "curved",
          "circular",
          "back_and_forth",
          "spiral"
        ]
      },
      {
        "hidden": false,
        "id": "select4234567894",
        "maxSelect": 1,
        "name": "amplitude",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "small",
          "medium",
          "large"
        ]
      },
      {
        "hidden": false,
        "id": "select4234567895",
        "maxSelect": 1,
        "name": "speed",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "slow",
          "normal",
          "fast"
        ]
      },
      {
        "hidden": false,
        "id": "number4234567896",
        "max": 20,
        "min": 1,
        "name": "repetitions",
        "noDecimal": true,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "bool4234567897",
        "name": "internal_movement_present",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "select4234567898",
        "maxSelect": 1,
        "name": "internal_movement_type",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "finger_wiggling",
          "wrist_rotation",
          "opening_closing",
          "bending_straightening"
        ]
      },
      {
        "hidden": false,
        "id": "text4234567899",
        "max": 500,
        "min": 0,
        "name": "internal_movement_details",
        "pattern": "",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "bool4234567800",
        "name": "smooth",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "bool4234567801",
        "name": "tense",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "bool4234567802",
        "name": "rhythmic",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "json4234567803",
        "maxSize": 1000,
        "name": "movement_features",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_hand_movements",
    "indexes": [],
    "listRule": null,
    "name": "hand_movements",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_hand_movements");
  return app.delete(collection);
});