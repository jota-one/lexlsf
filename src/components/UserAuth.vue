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
      <div class="dropdown dropdown-end">
        <button
          tabindex="0"
          role="button"
          class="flex items-center gap-3 px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
          :aria-label="`Menu de ${user?.name ?? 'mon compte'}`"
        >
          <div v-if="avatarUrl" class="flex-shrink-0">
            <img
              :src="avatarUrl"
              :alt="user?.name"
              class="w-10 h-10 rounded-full object-cover border border-white/30"
            />
          </div>
          <span v-else class="i-fa-solid-user text-lg text-white sm:hidden"></span>
          <div class="hidden sm:flex flex-col">
            <span class="text-xs font-medium text-white/70 uppercase tracking-wide"
              >Connecté(e)</span
            >
            <span class="text-sm font-semibold text-white">{{ user?.name }}</span>
          </div>
          <span class="hidden sm:block i-fa-solid-chevron-down text-xs text-white/70"></span>
        </button>
        <ul
          tabindex="0"
          class="dropdown-content menu bg-white shadow-lg rounded-box z-[1] w-56 p-2 border border-gray-200 mt-3"
        >
          <!-- Below lg the header hides the site navigation: this menu carries it instead -->
          <li v-for="link in navLinks" :key="link.href" class="lg:hidden">
            <a :href="link.href" class="flex items-center gap-3 text-gray-700 hover:bg-gray-100">
              <span :class="[link.icon, 'text-base']"></span>
              <span>{{ link.label }}</span>
            </a>
          </li>
          <li class="lg:hidden my-1 border-t border-gray-200" aria-hidden="true"></li>
          <li>
            <a href="/profile" class="flex items-center gap-3 text-gray-700 hover:bg-gray-100">
              <span class="i-fa-solid-user text-base"></span>
              <span>Mon compte</span>
            </a>
          </li>
          <li v-if="isAdmin || isStudent">
            <a href="/revisions" class="flex items-center gap-3 text-gray-700 hover:bg-gray-100">
              <span class="i-fa-solid-graduation-cap text-base"></span>
              <span>Mes quiz</span>
            </a>
          </li>
          <li v-if="isImpersonating">
            <button
              @click="exitImpersonation"
              class="flex items-center gap-3 text-amber-600 hover:bg-amber-50 w-full text-left"
            >
              <span class="i-fa-solid-user-secret text-base"></span>
              <span>Reprendre mon compte</span>
            </button>
          </li>
          <li>
            <button
              @click="handleLogout"
              class="flex items-center gap-3 text-red-600 hover:bg-red-50 w-full text-left"
            >
              <span class="i-fa-solid-sign-out-alt text-base"></span>
              <span>Déconnexion</span>
            </button>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTemplateRef } from 'vue'
import useAuth from '@admin/composables/useAuth'
import config from '@config'
import LoginModal from './LoginModal.vue'

const { isAuthenticated, isAdmin, isStudent, isImpersonating, user, logout, exitImpersonation } =
  useAuth()
const loginModalRef = useTemplateRef<InstanceType<typeof LoginModal>>('loginModalRef')

const avatarUrl = computed(() => {
  if (!user.value?.avatar) {
    return ''
  }
  return `${config.apiBaseUrl}/api/files/users/${user.value.id}/${user.value.avatar}`
})

const navLinks = computed(() => [
  { href: '/lexique', label: 'Lexique', icon: 'i-fa6-solid-hands' },
  { href: '/culture', label: 'Culture', icon: 'i-fa6-solid-address-card' },
  ...(isAdmin.value
    ? [
        { href: '/culture-generale', label: 'Culture générale', icon: 'i-fa6-solid-landmark' },
        {
          href: '/outils/champs-lexicaux',
          label: 'Champs lexicaux',
          icon: 'i-fa6-solid-diagram-project',
        },
        {
          href: '/outils/expressions-francaises',
          label: 'Expressions françaises',
          icon: 'i-fa6-solid-comment',
        },
        {
          href: '/outils/expressions-pi-sourdes',
          label: 'Expressions pi-sourdes',
          icon: 'i-fa6-solid-comments',
        },
        { href: '/admin', label: 'Admin', icon: 'i-fa6-solid-gear' },
      ]
    : []),
])

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
