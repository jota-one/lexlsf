/// <reference path="../pb_data/types.d.ts" />

// Content is for signed-in users only. Anonymous visitors could still read it:
// some view rules let `@request.auth.id = ''` through on purpose, lexical terms
// and videos had no rule at all, and for a visitor @request.auth.roles.id is
// empty, which PocketBase takes as matching a record without any role (Roles
// empty). Every content rule now requires a signed-in user, and role matching a
// user who holds at least one role. Categories, roles and hand configurations
// stay public: they are reference lists, not content.

const SIGNED_IN = "@request.auth.id != ''"
const BY_ROLE = `${SIGNED_IN} && (@request.auth.roles.slug ?= 'admin' || (@request.auth.roles.id != '' && @request.auth.roles.id ?= Roles.id))`

const ROLE_RULE = "@request.auth.roles.slug ?= 'admin' || @request.auth.roles.id ?= Roles.id"
const ROLE_OR_ANONYMOUS = `@request.auth.id = '' || \n  ${ROLE_RULE}`

// [list, view] before this migration, restored on rollback.
const BEFORE = {
  sign: [ROLE_RULE, ROLE_RULE],
  person: [ROLE_RULE, ROLE_RULE],
  french_expression: [ROLE_RULE, ROLE_OR_ANONYMOUS],
  lexical_field: [ROLE_RULE, ROLE_OR_ANONYMOUS],
  pi_deaf_expression: [ROLE_RULE, ROLE_OR_ANONYMOUS],
  general_culture: [ROLE_OR_ANONYMOUS, ROLE_OR_ANONYMOUS],
  lexical_term: ['', ''],
  video: ['', ''],
}

const AFTER = {
  sign: BY_ROLE,
  person: BY_ROLE,
  french_expression: BY_ROLE,
  lexical_field: BY_ROLE,
  pi_deaf_expression: BY_ROLE,
  general_culture: BY_ROLE,
  lexical_term: SIGNED_IN,
  video: SIGNED_IN,
}

migrate(
  app => {
    for (const [name, rule] of Object.entries(AFTER)) {
      const collection = app.findCollectionByNameOrId(name)
      collection.listRule = rule
      collection.viewRule = rule
      app.save(collection)
    }
  },
  app => {
    for (const [name, [list, view]] of Object.entries(BEFORE)) {
      const collection = app.findCollectionByNameOrId(name)
      collection.listRule = list
      collection.viewRule = view
      app.save(collection)
    }
  },
)
