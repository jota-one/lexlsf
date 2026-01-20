import { createRouter, createWebHistory } from 'vue-router'
import type { Router } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'QuizzesList',
    component: () => import('../views/QuizzesList.vue'),
  },
  {
    path: '/quiz/:id',
    name: 'QuizPlayer',
    component: () => import('../views/QuizPlayer.vue'),
  },
]

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL + 'revisions/'),
  routes,
})

export default router
