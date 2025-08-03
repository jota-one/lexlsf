/// <reference path="../pb_data/types.d.ts" />

// Migration PocketBase pour base de données LSF (Langue des Signes Française)
// Version CORRIGÉE - Fix définitif pour l'erreur "values: cannot be blank"
// Date: 2025-08-03

// ====================================================================
// MIGRATION 1: Collection pour les configurations de main
// ====================================================================

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
        "name": "hand_type",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "options": {
          "maxSelect": 1,
          "values": ["dominant", "non_dominant"]
        }
      },
      {
        "hidden": false,
        "id": "json1234567891",
        "name": "selected_fingers",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "select1234567892",
        "name": "finger_position",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "options": {
          "maxSelect": 1,
          "values": ["extended", "bent", "curved", "crossed", "hooked"]
        }
      },
      {
        "hidden": false,
        "id": "select1234567893",
        "name": "finger_spreading",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "options": {
          "maxSelect": 1,
          "values": ["spread", "closed", "neutral"]
        }
      },
      {
        "hidden": false,
        "id": "select1234567894",
        "name": "thumb_position",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "options": {
          "maxSelect": 1,
          "values": ["opposed", "extended", "bent", "closed", "crossed"]
        }
      },
      {
        "hidden": false,
        "id": "select1234567895",
        "name": "palm_shape",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "options": {
          "maxSelect": 1,
          "values": ["flat", "cupped", "curved", "hollow"]
        }
      },
      {
        "hidden": false,
        "id": "select1234567896",
        "name": "complexity",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "options": {
          "maxSelect": 1,
          "values": ["simple", "complex", "very_complex"]
        }
      },
      {
        "hidden": false,
        "id": "number1234567897",
        "name": "finger_group_complexity",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number",
        "options": {
          "min": 1,
          "max": 5,
          "noDecimal": true
        }
      },
      {
        "hidden": false,
        "id": "select1234567898",
        "name": "markedness",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "options": {
          "maxSelect": 1,
          "values": ["unmarked", "marked", "highly_marked"]
        }
      },
      {
        "hidden": false,
        "id": "json1234567899",
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
