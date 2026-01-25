/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const roles = app.findCollectionByNameOrId("pbc_2105053228")

  let record = new Record(roles)
  record.set("name", "Administrateur")
  record.set("slug", "admin")
  app.save(record)

  record = new Record(roles)
  record.set("name", "Etudiant")
  record.set("slug", "student")
  app.save(record)

}, () => {
  // Rollback : supprimer les rôles ajoutés
})
