/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text5001000011",
        "max": 0,
        "min": 0,
        "name": "name",
        "pattern": "",
        "presentable": true,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text5001000012",
        "max": 0,
        "min": 0,
        "name": "slug",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text5001000013",
        "max": 0,
        "min": 0,
        "name": "description",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text5001000014",
        "max": 10,
        "min": 0,
        "name": "start_date",
        "pattern": "^\\d{4}(-\\d{2}(-\\d{2})?)?$",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text5001000015",
        "max": 10,
        "min": 0,
        "name": "end_date",
        "pattern": "^(\\d{4}(-\\d{2}(-\\d{2})?)?)?$",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "file5001000016",
        "maxSelect": 10,
        "maxSize": 5242880,
        "mimeTypes": ["image/jpeg", "image/png", "image/webp", "image/gif"],
        "name": "images",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "thumbs": ["400x300"],
        "type": "file"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_4001000001",
        "hidden": false,
        "id": "relation5001000017",
        "maxSelect": 999,
        "minSelect": 0,
        "name": "LexicalFields",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_3094607438",
        "hidden": false,
        "id": "relation5001000018",
        "maxSelect": 999,
        "minSelect": 0,
        "name": "Signs",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_63941688",
        "hidden": false,
        "id": "relation5001000019",
        "maxSelect": 999,
        "minSelect": 0,
        "name": "Persons",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_2105053228",
        "hidden": false,
        "id": "relation5001000020",
        "maxSelect": 999,
        "minSelect": 0,
        "name": "Roles",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "autodate5001000021",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate5001000022",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id = '' || \n  @request.auth.roles.slug ?= 'admin' || @request.auth.roles.id ?= Roles.id",
    "viewRule": "@request.auth.id = '' || \n  @request.auth.roles.slug ?= 'admin' || @request.auth.roles.id ?= Roles.id",
    "createRule": "@request.auth.roles.slug ?= 'admin'",
    "updateRule": "@request.auth.roles.slug ?= 'admin'",
    "deleteRule": "@request.auth.roles.slug ?= 'admin'",
    "name": "general_culture",
    "system": false,
    "type": "base"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("general_culture");
  return app.delete(collection);
})
