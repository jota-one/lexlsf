import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Categories from '../views/Categories.vue'
import Signs from '../views/Signs.vue'
import HandConfigurations from '../views/HandConfigurations.vue'
import Persons from '../views/Persons.vue'
import Users from '../views/Users.vue'
import Quizzes from '../views/Quizzes.vue'
import QuizEdit from '../views/QuizEdit.vue'
import useAuth from '../composables/useAuth'

const routes = [
  { path: '', component: Home },
  { path: '/categories', component: Categories },
  { path: '/signs', component: Signs },
  { path: '/hand-configurations', component: HandConfigurations },
  { path: '/persons', component: Persons },
  { path: '/users', component: Users },
  { path: '/quizzes', component: Quizzes },
  { path: '/quizzes/:id/edit', component: QuizEdit },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL + 'admin/'),
  routes,
})

router.beforeEach((_to, _from, next) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated.value) {
    window.location.href = '/'
  } else {
    next()
  }
})

export default router
