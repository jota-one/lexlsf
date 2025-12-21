<template>
  <div>
    <button
      class="btn btn-primary px-5 py-2 font-semibold rounded-lg cursor-pointer"
      @click="openLoginModal"
    >
      Login
    </button>
    <LoginModal ref="loginModalRef" @login-success="handleLoginSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginModal from './LoginModal.vue'

const loginModalRef = ref<InstanceType<typeof LoginModal> | null>(null)

const openLoginModal = () => {
  loginModalRef.value?.open()
}

const handleLoginSuccess = () => {
  // Rediriger vers la page admin après connexion réussie
  window.location.href = '/admin'
}
</script>
