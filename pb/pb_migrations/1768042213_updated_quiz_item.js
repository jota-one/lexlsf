/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2982232029")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX idx_quiz_item_quiz ON quiz_item(Quiz)",
      "CREATE INDEX idx_quiz_item_position ON quiz_item(Quiz, position)",
      "CREATE UNIQUE INDEX `idx_T2XyweOTKT` ON `quiz_item` (\n  `Quiz`,\n  `item_id`\n)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2982232029")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX idx_quiz_item_quiz ON quiz_item(Quiz)",
      "CREATE INDEX idx_quiz_item_position ON quiz_item(Quiz, position)"
    ]
  }, collection)

  return app.save(collection)
})
