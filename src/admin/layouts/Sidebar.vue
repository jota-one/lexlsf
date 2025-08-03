<template>
  <div class="drawer lg:drawer-open">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" />
    <aside class="drawer-side">
      <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <ul class="menu bg-base-200 text-base-content min-h-full w-60 p-4">
        <li>
          <RouterLink to="/" class="flex items-center gap-3" active-class="menu-active">
            <span class="i-fa6-solid-house text-xl"></span>
            Home
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/categories" class="flex items-center gap-3" active-class="menu-active">
            <span class="i-fa-solid-layer-group text-xl"></span>
            Catégories
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/signs" class="flex items-center gap-3" active-class="menu-active">
            <span class="i-fa-solid-hands text-xl"></span>
            Signes
          </RouterLink>
        </li>
      </ul>
    </aside>
    <div class="drawer-content p-4">
      <label for="my-drawer" class="drawer-button cursor-pointer lg:hidden">
        <span class="i-fa-solid-bars text-xl"></span>
      </label>
      <slot />
    </div>
  </div>
</template>