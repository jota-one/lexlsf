/// <reference path="../pb_data/types.d.ts" />

// Migration PocketBase - Collection hand_configurations
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
        "id": "text3208210256",
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
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "select1234567890",
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
        "id": "json1234567891",
        "maxSize": 500,
        "name": "selected_fingers",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "select1234567892",
        "maxSelect": 1,
        "name": "finger_position",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "extended",
          "bent",
          "curved",
          "crossed",
          "hooked"
        ]
      },
      {
        "hidden": false,
        "id": "select1234567893",
        "maxSelect": 1,
        "name": "finger_spreading",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "spread",
          "closed",
          "neutral"
        ]
      },
      {
        "hidden": false,
        "id": "select1234567894",
        "maxSelect": 1,
        "name": "thumb_position",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "opposed",
          "extended",
          "bent",
          "closed",
          "crossed"
        ]
      },
      {
        "hidden": false,
        "id": "select1234567895",
        "maxSelect": 1,
        "name": "palm_shape",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "flat",
          "cupped",
          "curved",
          "hollow"
        ]
      },
      {
        "hidden": false,
        "id": "select1234567896",
        "maxSelect": 1,
        "name": "complexity",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "simple",
          "complex",
          "very_complex"
        ]
      },
      {
        "hidden": false,
        "id": "number1234567897",
        "max": 5,
        "min": 1,
        "name": "finger_group_complexity",
        "noDecimal": true,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "select1234567898",
        "maxSelect": 1,
        "name": "markedness",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "unmarked",
          "marked",
          "highly_marked"
        ]
      },
      {
        "hidden": false,
        "id": "json1234567899",
        "maxSize": 1000,
        "name": "phonological_features",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_hand_configurations",
    "indexes": [],
    "listRule": null,
    "name": "hand_configurations",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_hand_configurations");
  return app.delete(collection);
});