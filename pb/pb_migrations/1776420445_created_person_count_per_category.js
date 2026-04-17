/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // View returning one row per (category, role) pair with person counts.
  // Admin users aggregate all role rows client-side.
  const collection = new Collection({
    "id": "pbc_5001000002",
    "name": "person_count_per_category",
    "type": "view",
    "listRule": "@request.auth.id != ''",
    "viewRule": null,
    "viewQuery": "SELECT (cat.value || '_' || role.value) AS id, cat.value AS category_id, role.value AS role_id, COUNT(p.id) AS person_count FROM person p, json_each(p.Category) cat, json_each(p.Roles) role GROUP BY cat.value, role.value HAVING COUNT(p.id) > 0",
    "fields": [
      {
        "hidden": false,
        "id": "text3208210257",
        "max": 0,
        "min": 0,
        "name": "id",
        "pattern": "^[a-z0-9_]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "text5001000003",
        "name": "category_id",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "text5001000004",
        "name": "role_id",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "number5001000002",
        "name": "person_count",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      }
    ]
  });

  return app.save(collection);
}, (app) => {
  return app.delete(app.findCollectionByNameOrId("pbc_5001000002"));
})
