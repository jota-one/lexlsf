import { useLocalStorage } from '@vueuse/core'
import { pb } from '@lib/pb'
import { ref, computed } from 'vue'
import type { TUser } from '../../types'

// Impersonation must survive reloads, so it lives in localStorage
const impersonatorJwt = useLocalStorage('impersonatorJwt', '')
const authValid = ref(pb.authStore.isValid)
const user = ref<TUser.TRecord | null>(null)

// Charge l'utilisateur avec expand:roles pour déterminer les slugs
const loadUserWithRoles = async (model: { id?: string }) => {
  if (!model?.id) {return}
  try {
    const full = await pb.collection('users').getOne<TUser.TRecord>(model.id, {
      expand: 'roles',
    })
    user.value = full
  } catch (e) {
    console.error('Failed to load user with roles', e)
    user.value = model as TUser.TRecord // fallback minimal
  }
}

pb.authStore.onChange((_, model) => {
  authValid.value = pb.authStore.isValid
  if (model !== null) {
    void loadUserWithRoles(model)
  } else {
    user.value = null
  }
}, true)

export default function useAuth() {
  const login = async (auth: { email: string; password: string }) => {
    try {
      const authData = await pb.collection('users').authWithPassword(auth.email, auth.password, {
        expand: 'roles',
      })
      user.value = authData.record as unknown as TUser.TRecord
      return authData.token
    } catch (e) {
      return { error: true, message: (e as Error).message }
    }
  }

  // Rafraîchit la session et recharge les rôles (utile au rechargement de page)
  const refreshAuth = async () => {
    if (!pb.authStore.isValid) {return null}
    try {
      const data = await pb.collection('users').authRefresh({ expand: 'roles' })
      user.value = data.record as unknown as TUser.TRecord
      return data
    } catch (e) {
      console.error('Auth refresh failed', e)
      return null
    }
  }

  const logout = () => {
    pb.authStore.clear()
  }

  const isAuthenticated = computed(() => authValid.value)
  const roles = computed(() => user.value?.expand?.roles ?? [])
  const isAdmin = computed(() => roles.value.some(r => r?.slug === 'admin'))
  const isStudent = computed(() => roles.value.some(r => r?.slug === 'student'))
  const isImpersonating = computed(() => !!impersonatorJwt.value)

  const impersonate = async (userId: string) => {
    const authData = await pb.send(`/api/custom/impersonate/${userId}`, { method: 'POST' })
    impersonatorJwt.value = pb.authStore.token
    pb.authStore.save(authData.token, authData.record)
    window.location.href = '/'
  }

  const exitImpersonation = async () => {
    const adminJwt = impersonatorJwt.value
    impersonatorJwt.value = ''
    pb.authStore.save(adminJwt, null)
    await refreshAuth()
    window.location.href = '/admin'
  }

  return {
    isAuthenticated,
    isAdmin,
    isStudent,
    roles,
    isImpersonating,
    login,
    logout,
    refreshAuth,
    impersonate,
    exitImpersonation,
    pb,
    user,
  }
}
