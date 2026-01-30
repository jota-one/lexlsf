/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Step 1: Create quiz collection
  const quizCollection = new Collection({
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
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation_owner",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "Owner",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_title",
        "max": 200,
        "min": 0,
        "name": "title",
        "pattern": "",
        "presentable": true,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "convertURLs": false,
        "hidden": false,
        "id": "editor_description",
        "maxSize": 0,
        "name": "description",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "editor"
      },
      {
        "hidden": false,
        "id": "select_item_type",
        "maxSelect": 1,
        "name": "item_type",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": ["sign", "person", "mixed"]
      },
      {
        "hidden": false,
        "id": "json_settings",
        "maxSize": 0,
        "name": "settings",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
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
      }
    ],
    "indexes": [],
    "listRule": "Owner = @request.auth.id",
    "name": "quiz",
    "system": false,
    "type": "base",
    "createRule": "@request.auth.id != ''",
    "deleteRule": "Owner = @request.auth.id",
    "updateRule": "Owner = @request.auth.id",
    "viewRule": "Owner = @request.auth.id"
  });
  
  app.save(quizCollection);

  // Step 2: Create quiz_item collection (depends on quiz)
  const quizItemCollection = new Collection({
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210257",
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
        "cascadeDelete": true,
        "collectionId": quizCollection.id,
        "hidden": false,
        "id": "relation_quiz",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "Quiz",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "select_item_type",
        "maxSelect": 1,
        "name": "item_type",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": ["sign", "person"]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_item_id",
        "max": 15,
        "min": 15,
        "name": "item_id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "number_position",
        "max": null,
        "min": 0,
        "name": "position",
        "onlyInt": true,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "autodate2990389177",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085496",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "indexes": [
      "CREATE INDEX idx_quiz_item_quiz ON quiz_item(Quiz)",
      "CREATE INDEX idx_quiz_item_position ON quiz_item(Quiz, position)"
    ],
    "listRule": "@request.auth.id = Quiz.Owner.id",
    "name": "quiz_item",
    "system": false,
    "type": "base",
    "createRule": "@request.auth.id = Quiz.Owner.id",
    "deleteRule": "@request.auth.id = Quiz.Owner.id",
    "updateRule": "@request.auth.id = Quiz.Owner.id",
    "viewRule": "@request.auth.id = Quiz.Owner.id"
  });
  
  app.save(quizItemCollection);

  // Step 3: Create quiz_session collection (depends on quiz)
  const quizSessionCollection = new Collection({
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210258",
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
        "cascadeDelete": false,
        "collectionId": quizCollection.id,
        "hidden": false,
        "id": "relation_quiz2",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "Quiz",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation_user",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "User",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_config_key",
        "max": 50,
        "min": 0,
        "name": "config_key",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "date_started_at",
        "max": "",
        "min": "",
        "name": "started_at",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "date_completed_at",
        "max": "",
        "min": "",
        "name": "completed_at",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "json_settings_snapshot",
        "maxSize": 0,
        "name": "settings_snapshot",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json_stats",
        "maxSize": 0,
        "name": "stats",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "autodate2990389178",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085497",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "indexes": [
      "CREATE INDEX idx_quiz_session_user ON quiz_session(User)",
      "CREATE INDEX idx_quiz_session_quiz ON quiz_session(Quiz)",
      "CREATE INDEX idx_quiz_session_completed ON quiz_session(completed_at)"
    ],
    "listRule": "User = @request.auth.id",
    "name": "quiz_session",
    "system": false,
    "type": "base",
    "createRule": "@request.auth.id != '' && User = @request.auth.id",
    "deleteRule": "User = @request.auth.id",
    "updateRule": "User = @request.auth.id",
    "viewRule": "User = @request.auth.id"
  });
  
  app.save(quizSessionCollection);

  // Step 4: Create quiz_attempt collection (depends on quiz_session and quiz_item)
  const quizAttemptCollection = new Collection({
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210259",
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
        "cascadeDelete": true,
        "collectionId": quizSessionCollection.id,
        "hidden": false,
        "id": "relation_session",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "Session",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": quizItemCollection.id,
        "hidden": false,
        "id": "relation_quiz_item",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "QuizItem",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "select_result",
        "maxSelect": 1,
        "name": "result",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": ["known", "unknown", "skip"]
      },
      {
        "hidden": false,
        "id": "number_time_spent",
        "max": null,
        "min": 0,
        "name": "time_spent",
        "onlyInt": true,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "autodate2990389179",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085498",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "indexes": [
      "CREATE INDEX idx_quiz_attempt_session ON quiz_attempt(Session)",
      "CREATE INDEX idx_quiz_attempt_item ON quiz_attempt(QuizItem)",
      "CREATE INDEX idx_quiz_attempt_result ON quiz_attempt(result)"
    ],
    "listRule": "Session.User = @request.auth.id",
    "name": "quiz_attempt",
    "system": false,
    "type": "base",
    "createRule": "@request.auth.id != '' && Session.User = @request.auth.id",
    "deleteRule": "Session.User = @request.auth.id",
    "updateRule": "Session.User = @request.auth.id",
    "viewRule": "Session.User = @request.auth.id"
  });
  
  return app.save(quizAttemptCollection);
}, (app) => {
  // Rollback: Delete collections in reverse order
  const quizAttempt = app.findCollectionByNameOrId("quiz_attempt");
  const quizSession = app.findCollectionByNameOrId("quiz_session");
  const quizItem = app.findCollectionByNameOrId("quiz_item");
  const quiz = app.findCollectionByNameOrId("quiz");
  
  if (quizAttempt) app.delete(quizAttempt);
  if (quizSession) app.delete(quizSession);
  if (quizItem) app.delete(quizItem);
  if (quiz) app.delete(quiz);
})
