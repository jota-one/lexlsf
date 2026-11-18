import { test as base, expect, type Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { resolve } from 'node:path'

export const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090'
// Folder of the local PocketBase binary whose database PB_URL serves (`pnpm db`)
const PB_DIR = resolve(process.env.PB_DIR || 'pb')
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'e2e-admin@test.local'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'e2e-password-123'

export type Auth = { token: string; record: { id: string; [k: string]: unknown } }

// ─── PocketBase REST helpers ─────────────────────────────────────────────────

export async function pbFetch(path: string, init: RequestInit = {}, token?: string) {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return fetch(`${PB_URL}${path}`, { ...init, headers })
}

async function authWithPassword(
  email: string,
  password: string,
  collection = 'users',
): Promise<Auth> {
  const res = await pbFetch(`/api/collections/${collection}/auth-with-password`, {
    method: 'POST',
    body: JSON.stringify({ identity: email, password }),
  })
  if (!res.ok) {
    throw new Error(`Auth failed for ${email}: ${res.status}`)
  }
  return res.json() as Promise<Auth>
}

async function getAdminRoleId(token: string): Promise<string> {
  const res = await pbFetch(
    '/api/collections/roles/records?filter=' + encodeURIComponent('slug="admin"'),
    {},
    token,
  )
  const data = (await res.json()) as { items?: { id: string }[] }
  const id = data.items?.[0]?.id
  if (!id) {
    throw new Error('Admin role not found — is PocketBase seeded?')
  }
  return id
}

function pocketbaseCli(...args: string[]) {
  execFileSync('./pocketbase', args, { cwd: PB_DIR, stdio: 'pipe' })
}

/**
 * Runs `task` with a throwaway superuser, deleted afterwards.
 *
 * Only admins may create accounts, so the test account cannot be provisioned
 * through the public API. The superuser is created with the local PocketBase
 * CLI, which writes straight to the database the dev server uses.
 */
async function withTemporarySuperuser<T>(task: (token: string) => Promise<T>): Promise<T> {
  const email = 'e2e-setup@test.local'
  const password = randomBytes(18).toString('base64url')
  try {
    pocketbaseCli('superuser', 'upsert', email, password)
  } catch (e) {
    throw new Error(
      `Could not create a temporary superuser with ${PB_DIR}/pocketbase (build it with \`pnpm build:db\`, or set PB_DIR): ${(e as Error).message}`,
    )
  }
  try {
    const { token } = await authWithPassword(email, password, '_superusers')
    return await task(token)
  } finally {
    pocketbaseCli('superuser', 'delete', email)
  }
}

/**
 * Logs the admin test account in, creating it first when it does not exist.
 */
export async function ensureAdminAuth(): Promise<Auth> {
  try {
    return await authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD)
  } catch {
    // account missing — create it below
  }

  await withTemporarySuperuser(async token => {
    const roleId = await getAdminRoleId(token)
    const res = await pbFetch(
      '/api/collections/users/records',
      {
        method: 'POST',
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          emailVisibility: true,
          verified: true,
          password: ADMIN_PASSWORD,
          passwordConfirm: ADMIN_PASSWORD,
          name: 'E2E Admin',
          roles: [roleId],
        }),
      },
      token,
    )
    if (!res.ok) {
      throw new Error(`Could not create admin test account: ${res.status} ${await res.text()}`)
    }
  })
  return authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD)
}

/**
 * Injects the PocketBase authStore into localStorage before the page loads,
 * matching how the app persists its session (SDK default key).
 */
export async function injectAuth(page: Page, auth: Auth) {
  await page.addInitScript(({ token, record }) => {
    window.localStorage.setItem('pocketbase_auth', JSON.stringify({ token, record }))
  }, auth)
}

// ─── Custom fixtures ─────────────────────────────────────────────────────────

type Fixtures = {
  admin: Auth
  adminPage: Page
}

export const test = base.extend<Fixtures>({
  // Playwright requires the object-destructuring form even with no dependencies.
  // eslint-disable-next-line no-empty-pattern
  admin: async ({}, use) => {
    const auth = await ensureAdminAuth()
    await use(auth)
  },
  adminPage: async ({ page, admin }, use) => {
    await injectAuth(page, admin)
    await use(page)
  },
})

export { expect }
