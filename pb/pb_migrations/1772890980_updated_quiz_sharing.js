/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Add shared_with_users field to quiz collection and update access rules
  const quizCollection = app.findCollectionByNameOrId("quiz")

  quizCollection.fields.addAt(99, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation_shared_with_users",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "shared_with_users",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  unmarshal({
    "listRule": "Owner = @request.auth.id || shared_with_users.id ?= @request.auth.id",
    "viewRule": "Owner = @request.auth.id || shared_with_users.id ?= @request.auth.id"
  }, quizCollection)

  app.save(quizCollection)

  // 2. Update quiz_item access rules to allow shared users to read items
  const quizItemCollection = app.findCollectionByNameOrId("quiz_item")

  unmarshal({
    "listRule": "@request.auth.id = Quiz.Owner.id || Quiz.shared_with_users.id ?= @request.auth.id",
    "viewRule": "@request.auth.id = Quiz.Owner.id || Quiz.shared_with_users.id ?= @request.auth.id"
  }, quizItemCollection)

  app.save(quizItemCollection)
}, (app) => {
  // Revert quiz collection
  const quizCollection = app.findCollectionByNameOrId("quiz")

  quizCollection.fields.removeById("relation_shared_with_users")

  unmarshal({
    "listRule": "Owner = @request.auth.id",
    "viewRule": "Owner = @request.auth.id"
  }, quizCollection)

  app.save(quizCollection)

  // Revert quiz_item collection
  const quizItemCollection = app.findCollectionByNameOrId("quiz_item")

  unmarshal({
    "listRule": "@request.auth.id = Quiz.Owner.id",
    "viewRule": "@request.auth.id = Quiz.Owner.id"
  }, quizItemCollection)

  app.save(quizItemCollection)
})
