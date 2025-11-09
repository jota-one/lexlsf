// @ts-check
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

import vue from '@astrojs/vue';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    // ssr: {
    //   noExternal: ['vue', 'pocketbase'],
    // },
  },

  integrations: [vue({ appEntrypoint: "/src/pages/_app" })],
  outDir: 'pb/pb_public',

  adapter: node({
    mode: 'standalone',
  })
})