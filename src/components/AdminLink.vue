<template>
  <template v-if="isAuthenticated">
    <li class="text-md font-semibold text-white cursor-pointer">
      <a href="/revisions">Révisions</a>
    </li>
    <li class="text-md font-semibold text-white cursor-pointer">
      <a href="/admin">Admin</a>
    </li>
  </template>
</template>

<script setup lang="ts">
import useAuth from '@admin/composables/useAuth'

const { isAuthenticated } = useAuth()
</script>
