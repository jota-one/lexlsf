/**
 * Script de migration des slugs
 *
 * Ce script régénère tous les slugs existants pour les signes et les personnes
 * avec la nouvelle fonction createSlug améliorée.
 *
 * Usage:
 *   node --experimental-strip-types scripts/migrate-slugs.js
 *
 * IMPORTANT: Faire un backup de la base de données avant d'exécuter ce script!
 *   cp -r pb/pb_data pb/pb_data.backup.$(date +%Y%m%d)
 */

import PocketBase from 'pocketbase'
import { createSlug } from '../src/lib/slug.ts'

// Configuration - à adapter selon votre environnement
const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090'
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD

// Statistiques de migration
const stats = {
  signs: { total: 0, updated: 0, skipped: 0, errors: 0 },
  persons: { total: 0, updated: 0, skipped: 0, errors: 0 },
}

async function migrateCollection(pb, collectionName, getSlugFn) {
  console.log(`\n=== Migration de la collection "${collectionName}" ===`)

  try {
    const records = await pb.collection(collectionName).getFullList()
    const collectionStats = stats[collectionName === 'sign' ? 'signs' : 'persons']
    collectionStats.total = records.length

    for (const record of records) {
      const originalSlug = record.slug
      const newSlug = getSlugFn(record)

      // Sauvegarder les infos pour le rapport
      const displayName =
        collectionName === 'sign' ? record.name : `${record.firstname || ''} ${record.name}`.trim()

      // Seulement mettre à jour si le slug a changé
      if (originalSlug !== newSlug) {
        try {
          await pb.collection(collectionName).update(record.id, { slug: newSlug })
          console.log(`  ✓ [${record.id}] "${displayName}": "${originalSlug}" → "${newSlug}"`)
          collectionStats.updated++
        } catch (error) {
          console.error(`  ✗ [${record.id}] "${displayName}": ${error.message}`)
          collectionStats.errors++
        }
      } else {
        console.log(`  - [${record.id}] "${displayName}": slug inchangé ("${originalSlug}")`)
        collectionStats.skipped++
      }
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des enregistrements: ${error.message}`)
    throw error
  }
}

async function main() {
  console.log('🚀 Démarrage de la migration des slugs...\n')

  // Vérifier les variables d'environnement
  if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
    console.error("❌ Variables d'environnement manquantes!")
    console.error('   Définissez PB_ADMIN_EMAIL et PB_ADMIN_PASSWORD')
    console.error('\nExemple:')
    console.error(
      '   PB_ADMIN_EMAIL=admin@example.com PB_ADMIN_PASSWORD=password node scripts/migrate-slugs.js',
    )
    process.exit(1)
  }

  const pb = new PocketBase(PB_URL)

  try {
    // Authentification admin
    console.log(`📡 Connexion à PocketBase (${PB_URL})...`)

    // Essayer d'abord avec la méthode admins (peut fonctionner même si deprecated)
    try {
      await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD)
      console.log('✓ Authentification réussie (admins)\n')
    } catch {
      // Si ça échoue, essayer avec _superusers
      console.log('⚠️  Tentative avec admins échouée, essai avec _superusers...')
      await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD)
      console.log('✓ Authentification réussie (_superusers)\n')
    }

    // Migration des signes
    await migrateCollection(pb, 'sign', record => createSlug(record.name))

    // Migration des personnes
    await migrateCollection(pb, 'person', record => createSlug(record.name, record.firstname))

    // Afficher les statistiques finales
    console.log('\n=== Rapport de migration ===')
    console.log('\nSignes:')
    console.log(`  Total: ${stats.signs.total}`)
    console.log(`  Mis à jour: ${stats.signs.updated}`)
    console.log(`  Inchangés: ${stats.signs.skipped}`)
    console.log(`  Erreurs: ${stats.signs.errors}`)

    console.log('\nPersonnes:')
    console.log(`  Total: ${stats.persons.total}`)
    console.log(`  Mis à jour: ${stats.persons.updated}`)
    console.log(`  Inchangés: ${stats.persons.skipped}`)
    console.log(`  Erreurs: ${stats.persons.errors}`)

    const totalUpdated = stats.signs.updated + stats.persons.updated
    const totalErrors = stats.signs.errors + stats.persons.errors

    console.log(`\n✅ Migration terminée: ${totalUpdated} slugs mis à jour`)
    if (totalErrors > 0) {
      console.log(`⚠️  ${totalErrors} erreur(s) rencontrée(s)`)
      process.exit(1)
    }
  } catch (error) {
    console.error(`\n❌ Erreur fatale: ${error.message}`)
    console.error(error.stack)
    process.exit(1)
  }
}

void main()
