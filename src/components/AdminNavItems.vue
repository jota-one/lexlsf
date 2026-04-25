<template>
  <template v-if="isAdmin">
    <li class="text-md font-semibold text-white cursor-pointer"><a href="/culture-generale">Culture générale</a></li>
    <li class="text-md font-semibold text-white cursor-pointer">
      <div class="dropdown dropdown-hover">
        <div tabindex="0" role="button" class="text-md font-semibold text-white">Outils</div>
        <ul tabindex="0" class="dropdown-content menu bg-base-100 text-base-content rounded-box z-50 w-52 p-2 shadow-lg">
          <li><a href="/outils/champs-lexicaux">Champs lexicaux</a></li>
          <li><a href="/outils/expressions-francaises">Expressions françaises</a></li>
          <li><a href="/outils/expressions-pi-sourdes">Expressions pi-sourdes</a></li>
        </ul>
      </div>
    </li>
  </template>
</template>

<script setup lang="ts">
import useAuth from '@admin/composables/useAuth'

const { isAdmin } = useAuth()
</script>
