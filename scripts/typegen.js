/**
 * Generate the PocketBase record types from the local database schema.
 *
 *   pnpm typegen
 *
 * Run it after applying a migration (start `pnpm db` once so PocketBase applies
 * it), then commit the regenerated src/types/pocketbase-types.ts.
 *
 * pocketbase-typegen reads a database through better-sqlite3, a native module
 * we keep out of the install. Node's built-in SQLite reads the schema instead,
 * the same query the tool runs, and the tool only turns it into types.
 */
import { writeFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { generateFromSchema } from 'pocketbase-typegen'

const DB_PATH = 'pb/pb_data/data.db'
const OUT_PATH = 'src/types/pocketbase-types.ts'

const db = new DatabaseSync(DB_PATH, { readOnly: true })
const collections = db
  .prepare('SELECT * FROM _collections')
  .all()
  .map(collection => ({ ...collection, fields: JSON.parse(String(collection.fields ?? '[]')) }))
db.close()

writeFileSync(OUT_PATH, generateFromSchema(collections), 'utf8')
console.log(`Generated ${OUT_PATH} from ${collections.length} collections`)
