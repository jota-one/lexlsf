import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Categories from '../views/Categories.vue'
import Signs from '../views/Signs.vue'

const routes = [
  { path: '', component: Home },
  { path: '/categories', component: Categories },
  { path: '/signs', component: Signs }
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL + 'admin/'),
  routes
})