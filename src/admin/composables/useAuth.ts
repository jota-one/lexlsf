import { useSessionStorage } from '@vueuse/core'
import PocketBase from 'pocketbase'
import { ref, computed } from 'vue'
import config from '../../config'

const pb = new PocketBase(config.apiBaseUrl)

const userJwt = useSessionStorage('userJwt', '')
const user = ref<any>({})
// Charge l'utilisateur avec expand:roles pour déterminer les slugs
const loadUserWithRoles = async (model: any) => {
  if (!model?.id) return
  try {
    const full = await pb.collection('users').getOne(model.id, {
      expand: 'roles',
    })
    user.value = full
  } catch (e) {
    console.error('Failed to load user with roles', e)
    user.value = model // fallback minimal
  }
}

pb.authStore.onChange((_, model) => {
  if (model !== null) {
    void loadUserWithRoles(model)
  }
}, true)

export default function useAuth() {
  const login = async (auth: { email: string; password: string }) => {
    try {
      const authData = await pb.collection('users').authWithPassword(auth.email, auth.password, {
        expand: 'roles',
      })
      userJwt.value = authData.token
      user.value = authData.record
      return authData.token
    } catch (e: any) {
      return { error: true, message: e.message }
    }
  }

  // Rafraîchit la session et recharge les rôles (utile au rechargement de page)
  const refreshAuth = async () => {
    if (!pb.authStore.isValid) return null
    try {
      const data = await pb.collection('users').authRefresh({ expand: 'roles' })
      userJwt.value = data.token
      user.value = data.record
      return data
    } catch (e) {
      console.error('Auth refresh failed', e)
      return null
    }
  }

  const logout = () => {
    pb.authStore.clear()
    userJwt.value = ''
    user.value = {}
  }

  const isAuthenticated = computed(() => !!userJwt.value && userJwt.value.length > 0)
  const roles = computed(() => user.value?.expand?.roles ?? [])
  const isAdmin = computed(() => roles.value.some((r: any) => r?.slug === 'admin'))

  return {
    isAuthenticated,
    isAdmin,
    login,
    logout,
    refreshAuth,
    pb,
    user,
    userJwt,
  }
}
