import { useSessionStorage } from '@vueuse/core'
import PocketBase from 'pocketbase'
import { ref, computed } from 'vue'
import config from '../../config'

const pb = new PocketBase(config.apiBaseUrl)

const userJwt = useSessionStorage('userJwt', '')
const user = ref<any>({})

pb.authStore.onChange((_, model) => {
  if (model !== null) {
    user.value = model
  }
}, true)

export default function useAuth() {
  const login = async (auth: { email: string; password: string }) => {
    try {
      const authData = await pb.collection('users').authWithPassword(auth.email, auth.password)
      userJwt.value = authData.token
      user.value = authData.record
      return authData.token
    } catch (e: any) {
      return { error: true, message: e.message }
    }
  }

  const logout = () => {
    pb.authStore.clear()
    userJwt.value = ''
    user.value = {}
  }

  const isAuthenticated = computed(() => !!userJwt.value && userJwt.value.length > 0)

  return {
    isAuthenticated,
    login,
    logout,
    pb,
    user,
    userJwt,
  }
}
