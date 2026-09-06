/**
 * One-shot script: create the "Type de terme" category subset and its term types.
 *
 * Term types are categories tagged with the `lexical_term` entity, grouped under
 * a single parent category. The script is idempotent: it creates what is missing
 * and completes what already exists (parent, entity tag), never duplicating.
 *
 * It never deletes anything. Term types already in base but absent from the list
 * below are only reported, with how many terms still point at them.
 *
 * Default mode is dry-run (no writes).
 * Use --commit to actually persist changes.
 *
 * Usage:
 *   PB_URL=https://... PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... node scripts/seed-lexical-term-types.js
 *   PB_URL=https://... PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... node scripts/seed-lexical-term-types.js --commit
 */

import PocketBase from 'pocketbase'

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090'
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD

const isCommit = process.argv.includes('--commit')
const isDryRun = !isCommit

const ENTITY = 'lexical_term'

/** Parent category holding the whole subset. */
const PARENT_TAG = 'Type de terme'

/** The term types to have, in display order. */
const TERM_TYPES = [
  'Personne / acteur',
  'Statut / qualité',
  'Action',
  'Procédure / mesure / dispositif',
  'Objet / document / support',
  'Institution / lieu / service',
  'Notion / concept',
  'Expression / construction / discours',
  'Autres',
]

/** Mirrors `createSlug` from src/lib/slug.ts. */
function createSlug(name) {
  let text = name.trim()
  text = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  text = text.toLowerCase()
  const specialChars = { œ: 'oe', æ: 'ae', ç: 'c' }
  for (const [char, replacement] of Object.entries(specialChars)) {
    text = text.replace(new RegExp(char, 'g'), replacement)
  }
  text = text.replace(/[\s_''""`´]+/g, '-')
  text = text.replace(/[^a-z0-9-]/g, '')
  text = text.replace(/--+/g, '-')
  text = text.replace(/^-+|-+$/g, '')
  return text || 'untitled'
}

async function authAsSuperuser(pb) {
  await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD)
}

async function main() {
  console.log('=== Seed lexical term types ===')
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

    const categories = await pb
      .collection('category')
      .getFullList({ fields: 'id,tag,slug,Parent,entities' })
    console.log(`Total categories: ${categories.length}`)

    const bySlug = new Map(categories.map(category => [category.slug, category]))

    // 1. The parent category holding the subset.
    const parentSlug = createSlug(PARENT_TAG)
    let parent = bySlug.get(parentSlug)
    let parentId = parent?.id || null

    if (parent) {
      console.log(`\nParent "${PARENT_TAG}" already exists (${parent.id}).`)
    } else if (isDryRun) {
      console.log(`\n[DRY-RUN] Would create parent "${PARENT_TAG}" (slug: ${parentSlug})`)
    } else {
      parent = await pb
        .collection('category')
        .create({ tag: PARENT_TAG, slug: parentSlug, Parent: null, entities: [] })
      parentId = parent.id
      console.log(`\n[OK] Created parent "${PARENT_TAG}" (${parent.id})`)
    }

    // 2. The term types themselves.
    let created = 0
    let updated = 0
    let unchanged = 0
    let errors = 0

    console.log('\n--- Term types ---')
    for (const tag of TERM_TYPES) {
      const slug = createSlug(tag)
      const existing = bySlug.get(slug)

      if (!existing) {
        if (isDryRun) {
          console.log(`[DRY-RUN] Would create "${tag}" (slug: ${slug})`)
        } else {
          try {
            const record = await pb
              .collection('category')
              .create({ tag, slug, Parent: parentId, entities: [ENTITY] })
            console.log(`[OK] Created "${tag}" (${record.id})`)
          } catch (error) {
            errors += 1
            console.error(`[ERR] Failed to create "${tag}": ${error.message}`)
            continue
          }
        }
        created += 1
        continue
      }

      // Already there: make sure it is tagged and attached to the subset.
      const entities = Array.isArray(existing.entities) ? existing.entities : []
      const payload = {}
      if (!entities.includes(ENTITY)) {
        payload.entities = [...entities, ENTITY]
      }
      if (parentId && existing.Parent !== parentId) {
        payload.Parent = parentId
      }

      if (Object.keys(payload).length === 0) {
        unchanged += 1
        console.log(`[SKIP] "${tag}" already correct (${existing.id})`)
        continue
      }

      if (isDryRun) {
        console.log(`[DRY-RUN] Would update "${tag}" (${existing.id}): ${JSON.stringify(payload)}`)
      } else {
        try {
          await pb.collection('category').update(existing.id, payload)
          console.log(`[OK] Updated "${tag}" (${existing.id})`)
        } catch (error) {
          errors += 1
          console.error(`[ERR] Failed to update "${tag}": ${error.message}`)
          continue
        }
      }
      updated += 1
    }

    // 3. Report the term types that are not part of the new list.
    const wantedSlugs = new Set(TERM_TYPES.map(createSlug))
    const leftovers = categories.filter(
      category =>
        (Array.isArray(category.entities) ? category.entities : []).includes(ENTITY) &&
        !wantedSlugs.has(category.slug),
    )

    console.log('\n--- Term types outside the list (left untouched) ---')
    if (leftovers.length === 0) {
      console.log('None.')
    } else {
      const terms = await pb.collection('lexical_term').getFullList({ fields: 'id,Type' })
      const usage = new Map()
      for (const term of terms) {
        if (term.Type) {
          usage.set(term.Type, (usage.get(term.Type) || 0) + 1)
        }
      }
      for (const category of leftovers) {
        console.log(`- "${category.tag}" (${category.id}) — ${usage.get(category.id) || 0} terme(s)`)
      }
      console.log('\nDecide separately whether to remap those terms and remove these categories.')
    }

    console.log('\n=== Summary ===')
    console.log(`Created: ${created}`)
    console.log(`Updated: ${updated}`)
    console.log(`Already correct: ${unchanged}`)
    console.log(`Outside the list: ${leftovers.length}`)
    if (!isDryRun) {
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

void main()
