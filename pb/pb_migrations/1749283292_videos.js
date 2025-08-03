/// <reference path="../pb_data/types.d.ts" />

// Migration PocketBase - Collection videos
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
        "id": "text3208210262",
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
        "id": "autodate2990389182",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085501",
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
        "id": "relation7234567890",
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
        "id": "file7234567891",
        "maxSelect": 1,
        "maxSize": 104857600,
        "mimeTypes": [
          "video/mp4",
          "video/avi",
          "video/mov",
          "video/webm"
        ],
        "name": "video_file",
        "presentable": false,
        "required": true,
        "system": false,
        "thumbs": [
          "100x100",
          "300x300"
        ],
        "type": "file"
      },
      {
        "hidden": false,
        "id": "select7234567892",
        "maxSelect": 1,
        "name": "camera_angle",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "frontal",
          "profile",
          "three_quarter",
          "overhead"
        ]
      },
      {
        "hidden": false,
        "id": "select7234567893",
        "maxSelect": 1,
        "name": "quality",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "SD",
          "HD",
          "4K"
        ]
      },
      {
        "hidden": false,
        "id": "number7234567894",
        "max": 60000,
        "min": 0,
        "name": "duration_ms",
        "noDecimal": true,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "json7234567895",
        "maxSize": 1000,
        "name": "signer_info",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json7234567896",
        "maxSize": 1500,
        "name": "recording_conditions",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json7234567897",
        "maxSize": 2000,
        "name": "temporal_annotations",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_videos",
    "indexes": [],
    "listRule": null,
    "name": "videos",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_videos");
  return app.delete(collection);
});