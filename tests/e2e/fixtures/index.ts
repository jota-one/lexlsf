import { test as base, expect, type Page } from '@playwright/test'

export const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090'
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

async function authWithPassword(email: string, password: string): Promise<Auth> {
  const res = await pbFetch('/api/collections/users/auth-with-password', {
    method: 'POST',
    body: JSON.stringify({ identity: email, password }),
  })
  if (!res.ok) {
    throw new Error(`Auth failed for ${email}: ${res.status}`)
  }
  return res.json() as Promise<Auth>
}

async function getAdminRoleId(): Promise<string> {
  // The roles collection is publicly listable, so the admin role id can be
  // fetched before any account exists.
  const res = await pbFetch(
    '/api/collections/roles/records?filter=' + encodeURIComponent('slug="admin"'),
  )
  const data = (await res.json()) as { items?: { id: string }[] }
  const id = data.items?.[0]?.id
  if (!id) {
    throw new Error('Admin role not found — is PocketBase seeded?')
  }
  return id
}

/**
 * Logs the admin test account in, creating it first when it does not exist.
 *
 * The `users` collection has an open create rule and an assignable `roles`
 * relation, so the account (admin role included) can be provisioned entirely
 * through the public API — no seeded credentials or email verification needed.
 */
export async function ensureAdminAuth(): Promise<Auth> {
  try {
    return await authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD)
  } catch {
    // account missing — create it below
  }

  const roleId = await getAdminRoleId()
  const res = await pbFetch('/api/collections/users/records', {
    method: 'POST',
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      emailVisibility: true,
      password: ADMIN_PASSWORD,
      passwordConfirm: ADMIN_PASSWORD,
      name: 'E2E Admin',
      roles: [roleId],
    }),
  })
  if (!res.ok) {
    throw new Error(`Could not create admin test account: ${res.status} ${await res.text()}`)
  }
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
