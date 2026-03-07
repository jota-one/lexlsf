/**
 * One-shot script: add role "student" to all sign records.
 *
 * Default mode is dry-run (no writes).
 * Use --commit to actually persist changes.
 *
 * Usage:
 *   PB_URL=https://... PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... node scripts/set-sign-student-role.js
 *   PB_URL=https://... PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... node scripts/set-sign-student-role.js --commit
 */

import PocketBase from 'pocketbase'

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090'
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD

const isCommit = process.argv.includes('--commit')
const isDryRun = !isCommit

function uniq(values) {
  return [...new Set(values.filter(Boolean))]
}

async function authAsSuperuser(pb) {
  await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD)
}

async function main() {
  console.log('=== Set student role on all signs ===')
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (no write)' : 'COMMIT (writes enabled)'}`)

  if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
    console.error('Missing env vars: PB_ADMIN_EMAIL and/or PB_ADMIN_PASSWORD')
    process.exit(1)
  }

  const pb = new PocketBase(PB_URL)

  try {
    console.log(`Connecting to ${PB_URL}...`)
    await authAsSuperuser(pb)
    console.log('Authenticated as superuser.')

    const studentRole = await pb.collection('roles').getFirstListItem("slug='student'", {
      fields: 'id,slug,name',
    })
    const studentRoleId = studentRole.id

    console.log(`Student role found: ${studentRoleId} (${studentRole.name || studentRole.slug})`)

    const signs = await pb.collection('sign').getFullList({ fields: 'id,name,Roles' })
    console.log(`Total signs: ${signs.length}`)

    let wouldUpdate = 0
    let alreadyOk = 0
    let updated = 0
    let errors = 0

    for (const sign of signs) {
      const currentRoles = Array.isArray(sign.Roles) ? sign.Roles : []
      const nextRoles = uniq([...currentRoles, studentRoleId])

      if (nextRoles.length === currentRoles.length) {
        alreadyOk += 1
        continue
      }

      wouldUpdate += 1
      const label = sign.name || sign.id

      if (isDryRun) {
        console.log(`[DRY-RUN] Would update sign ${sign.id} (${label})`)
        continue
      }

      try {
        await pb.collection('sign').update(sign.id, { Roles: nextRoles })
        updated += 1
        console.log(`[OK] Updated sign ${sign.id} (${label})`)
      } catch (error) {
        errors += 1
        console.error(`[ERR] Failed on sign ${sign.id}: ${error.message}`)
      }
    }

    console.log('\n=== Summary ===')
    console.log(`Already had student role: ${alreadyOk}`)
    console.log(`Needs update: ${wouldUpdate}`)
    if (!isDryRun) {
      console.log(`Updated: ${updated}`)
      console.log(`Errors: ${errors}`)
    }

    if (isDryRun) {
      console.log('\nDry-run complete. Re-run with --commit to apply changes.')
    }

    if (!isDryRun && errors > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error(`Fatal error: ${error.message}`)
    process.exit(1)
  }
}

main()
