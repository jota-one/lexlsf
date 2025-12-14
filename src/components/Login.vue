<template>
  <button
    class="btn btn-primary px-5 py-2 font-semibold rounded-lg cursor-pointer"
    @click="openLoginModal"
  >
    Login
  </button>
</template>

<script setup lang="ts">
const openLoginModal = () => {
    window.location.href = '/admin';
}
</script>
