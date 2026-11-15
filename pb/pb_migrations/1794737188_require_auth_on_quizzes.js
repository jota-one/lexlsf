/// <reference path="../pb_data/types.d.ts" />

// Anonymous visitors could list every quiz and its items, and a signed-in user
// without any role could list every quiz. For them @request.auth.id or
// @request.auth.roles.id is empty, and PocketBase compares an empty relation
// (no shared users, no shared roles) to an empty value as equal. The rules now
// require a signed-in user, and the shared-roles clause a user holding a role.

const SIGNED_IN = "@request.auth.id != ''"
const HAS_ROLE = "@request.auth.roles.id != ''"

const QUIZ_BEFORE =
  'Owner = @request.auth.id || shared_with_users.id ?= @request.auth.id || shared_with_roles.id ?= @request.auth.roles.id'
const QUIZ_AFTER = `${SIGNED_IN} && (Owner = @request.auth.id || shared_with_users.id ?= @request.auth.id || (${HAS_ROLE} && shared_with_roles.id ?= @request.auth.roles.id))`

const ITEM_BEFORE =
  '@request.auth.id = Quiz.Owner.id || Quiz.shared_with_users.id ?= @request.auth.id || Quiz.shared_with_roles.id ?= @request.auth.roles.id'
const ITEM_AFTER = `${SIGNED_IN} && (@request.auth.id = Quiz.Owner.id || Quiz.shared_with_users.id ?= @request.auth.id || (${HAS_ROLE} && Quiz.shared_with_roles.id ?= @request.auth.roles.id))`

// The card-count view exposes the same fields as quiz and follows its rule.
const set = (app, rules) => {
  for (const [name, rule] of Object.entries(rules)) {
    const collection = app.findCollectionByNameOrId(name)
    collection.listRule = rule
    collection.viewRule = rule
    app.save(collection)
  }
}

migrate(
  app => set(app, { quiz: QUIZ_AFTER, quiz_counts: QUIZ_AFTER, quiz_item: ITEM_AFTER }),
  app => set(app, { quiz: QUIZ_BEFORE, quiz_counts: QUIZ_BEFORE, quiz_item: ITEM_BEFORE }),
)
