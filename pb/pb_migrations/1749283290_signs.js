/// <reference path="../pb_data/types.d.ts" />

// Migration PocketBase - Collection signs
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
        "id": "text3208210260",
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
        "id": "autodate2990389180",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085499",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "text5234567890",
        "max": 100,
        "min": 1,
        "name": "gloss",
        "pattern": "^[A-Z][A-Z0-9_-]*$",
        "presentable": true,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select5234567891",
        "maxSelect": 1,
        "name": "verification_status",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "unverified",
          "pending",
          "verified",
          "disputed"
        ]
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_hand_configurations",
        "displayFields": [
          "hand_type",
          "finger_position"
        ],
        "hidden": false,
        "id": "relation5234567892",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "dominant_hand_config",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_hand_configurations",
        "displayFields": [
          "hand_type",
          "finger_position"
        ],
        "hidden": false,
        "id": "relation5234567893",
        "maxSelect": 1,
        "minSelect": null,
        "name": "non_dominant_hand_config",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_hand_orientations",
        "displayFields": [
          "hand_type",
          "palm_facing"
        ],
        "hidden": false,
        "id": "relation5234567894",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "dominant_hand_orientation",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_hand_orientations",
        "displayFields": [
          "hand_type",
          "palm_facing"
        ],
        "hidden": false,
        "id": "relation5234567895",
        "maxSelect": 1,
        "minSelect": null,
        "name": "non_dominant_hand_orientation",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_hand_locations",
        "displayFields": [
          "hand_type",
          "body_region"
        ],
        "hidden": false,
        "id": "relation5234567896",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "dominant_hand_location",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_hand_locations",
        "displayFields": [
          "hand_type",
          "body_region"
        ],
        "hidden": false,
        "id": "relation5234567897",
        "maxSelect": 1,
        "minSelect": null,
        "name": "non_dominant_hand_location",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_hand_movements",
        "displayFields": [
          "hand_type",
          "direction"
        ],
        "hidden": false,
        "id": "relation5234567898",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "dominant_hand_movement",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_hand_movements",
        "displayFields": [
          "hand_type",
          "direction"
        ],
        "hidden": false,
        "id": "relation5234567899",
        "maxSelect": 1,
        "minSelect": null,
        "name": "non_dominant_hand_movement",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "select5234567800",
        "maxSelect": 1,
        "name": "hand_coordination",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "one_handed_dominant",
          "one_handed_non_dominant",
          "two_handed_synchronous",
          "two_handed_alternating",
          "two_handed_sequential"
        ]
      },
      {
        "hidden": false,
        "id": "json5234567801",
        "maxSize": 2500,
        "name": "facial_expression",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json5234567802",
        "maxSize": 1500,
        "name": "head_body_posture",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "select5234567803",
        "maxSelect": 1,
        "name": "learning_source",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "dictionary",
          "teacher",
          "community",
          "family",
          "media",
          "research",
          "other"
        ]
      },
      {
        "hidden": false,
        "id": "json5234567804",
        "maxSize": 1500,
        "name": "source_details",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "select5234567805",
        "maxSelect": 1,
        "name": "primary_language",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "LSF",
          "LSR",
          "ASL",
          "other"
        ]
      },
      {
        "hidden": false,
        "id": "json5234567806",
        "maxSize": 2000,
        "name": "usage_context",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json5234567807",
        "maxSize": 2500,
        "name": "variants_relations",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "number5234567808",
        "max": 1,
        "min": 0,
        "name": "quality_score",
        "noDecimal": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "number5234567809",
        "max": 1,
        "min": 0,
        "name": "completeness",
        "noDecimal": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      }
    ],
    "id": "pbc_signs",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_gloss` ON `signs` (`gloss`)"
    ],
    "listRule": null,
    "name": "signs",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_signs");
  return app.delete(collection);
});