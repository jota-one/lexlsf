/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3094607438")

  // update collection data
  unmarshal({
    "createRule": "",
    "listRule": "",
    "updateRule": "",
    "viewRule": "",
    "deleteRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3094607438")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null,
    "deleteRule": null
  }, collection)

  return app.save(collection)
})
