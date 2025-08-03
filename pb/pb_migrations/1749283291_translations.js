/// <reference path="../pb_data/types.d.ts" />

// Migration PocketBase - Collection translations
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
        "id": "text3208210261",
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
        "id": "autodate2990389181",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085500",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "cascadeDelete": true,
        "collectionId": "pbc_signs",
        "displayFields": [
          "gloss"
        ],
        "hidden": false,
        "id": "relation6234567890",
        "maxSelect": 1,
        "minSelect": 1,
        "name": "sign",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "select6234567891",
        "maxSelect": 1,
        "name": "language_code",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "fr",
          "en",
          "de",
          "it",
          "es",
          "lsf",
          "lsr",
          "asl"
        ]
      },
      {
        "hidden": false,
        "id": "text6234567892",
        "max": 500,
        "min": 1,
        "name": "translation",
        "pattern": "",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select6234567893",
        "maxSelect": 1,
        "name": "translation_type",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "equivalent",
          "approximate",
          "explanation"
        ]
      },
      {
        "hidden": false,
        "id": "select6234567894",
        "maxSelect": 1,
        "name": "confidence_level",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "low",
          "medium",
          "high"
        ]
      }
    ],
    "id": "pbc_translations",
    "indexes": [],
    "listRule": null,
    "name": "translations",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_translations");
  return app.delete(collection);
});