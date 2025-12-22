<template>
  <div class="flex gap-5 items-center">
    <template v-if="!isAuthenticated">
      <button
        class="btn btn-primary px-5 py-2 font-semibold rounded-lg cursor-pointer"
        @click="openLoginModal"
      >
        Login
      </button>
      <LoginModal ref="loginModalRef" @login-success="handleLoginSuccess" />
    </template>
    <template v-else>
      <div
        class="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors"
      >
        <div class="flex flex-col">
          <span class="text-xs font-medium text-white/70 uppercase tracking-wide">Connecté(e)</span>
          <span class="text-sm font-semibold text-white">{{ user.name }}</span>
        </div>
        <button
          class="ml-2 p-1.5 rounded-md hover:bg-white/20 transition-colors text-white/80 hover:text-white"
          @click="handleLogout"
          title="Déconnexion"
        >
          <span class="i-fa-solid-sign-out-alt text-base"></span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import useAuth from '@admin/composables/useAuth'
import LoginModal from "./LoginModal.vue"

const { isAuthenticated, user, logout } = useAuth()
const loginModalRef = useTemplateRef<InstanceType<typeof LoginModal>>('loginModalRef')

const openLoginModal = () => {
  loginModalRef.value?.open()
}

const handleLoginSuccess = () => {
  // Rester sur la même page après connexion
  // Le composant se mettra à jour automatiquement grâce à la réactivité
}

const handleLogout = () => {
  logout()
  window.location.reload()
}
</script>
