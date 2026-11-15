/// <reference path="../pb_data/types.d.ts" />

// Closes a privilege escalation on the users collection. Sign-up was public
// (createRule '') and the roles collection is world-readable, so anyone could
// create an account with the admin role id in `roles`. Accounts are created by
// an admin from the users screen, so creation is now admin-only. A user may
// still update their own record, but never their roles or verified state, and
// an admin can update any user — including resetting a password, which is
// what manageRule allows.

const ADMIN = "@request.auth.roles.slug ?= 'admin'"

migrate(
  app => {
    const users = app.findCollectionByNameOrId('users')
    users.createRule = ADMIN
    users.updateRule = `(id = @request.auth.id && @request.body.roles:isset = false && @request.body.verified:isset = false) || ${ADMIN}`
    users.manageRule = ADMIN
    app.save(users)
  },
  app => {
    const users = app.findCollectionByNameOrId('users')
    users.createRule = ''
    users.updateRule = 'id = @request.auth.id'
    users.manageRule = ADMIN
    app.save(users)
  },
)
