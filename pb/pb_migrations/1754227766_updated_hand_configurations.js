/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_hand_configurations")

  // remove field
  collection.fields.removeById("json1234567891")

  // remove field
  collection.fields.removeById("select1234567892")

  // remove field
  collection.fields.removeById("select1234567893")

  // remove field
  collection.fields.removeById("select1234567894")

  // remove field
  collection.fields.removeById("select1234567895")

  // remove field
  collection.fields.removeById("select1234567896")

  // remove field
  collection.fields.removeById("number1234567897")

  // remove field
  collection.fields.removeById("select1234567898")

  // remove field
  collection.fields.removeById("json1234567899")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "file3598424642",
    "maxSelect": 1,
    "maxSize": 500000,
    "mimeTypes": [
      "image/jpeg",
      "image/png",
      "image/svg+xml",
      "image/gif",
      "image/webp"
    ],
    "name": "illustration",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [
      "100x100",
      "800x800"
    ],
    "type": "file"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1579384326",
    "max": 0,
    "min": 0,
    "name": "name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_hand_configurations")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "json1234567891",
    "maxSize": 500,
    "name": "selected_fingers",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(5, new Field({
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
  }))

  // add field
  collection.fields.addAt(6, new Field({
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
  }))

  // add field
  collection.fields.addAt(7, new Field({
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
  }))

  // add field
  collection.fields.addAt(8, new Field({
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
  }))

  // add field
  collection.fields.addAt(9, new Field({
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
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number1234567897",
    "max": 5,
    "min": 1,
    "name": "finger_group_complexity",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(11, new Field({
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
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "json1234567899",
    "maxSize": 1000,
    "name": "phonological_features",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // remove field
  collection.fields.removeById("file3598424642")

  // remove field
  collection.fields.removeById("text1579384326")

  return app.save(collection)
})
