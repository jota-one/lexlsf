import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Categories from '../views/Categories.vue'
import Signs from '../views/Signs.vue'
import HandConfigurations from '../views/HandConfigurations.vue'
import Persons from '../views/Persons.vue'
import Users from '../views/Users.vue'
import Quizzes from '../views/Quizzes.vue'
import QuizEdit from '../views/QuizEdit.vue'
import LexicalFields from '../views/LexicalFields.vue'
import FrenchExpressions from '../views/FrenchExpressions.vue'
import PiDeafExpressions from '../views/PiDeafExpressions.vue'
import GeneralCulture from '../views/GeneralCulture.vue'
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
  { path: '/lexical-fields', component: LexicalFields },
  { path: '/french-expressions', component: FrenchExpressions },
  { path: '/pi-deaf-expressions', component: PiDeafExpressions },
  { path: '/general-culture', component: GeneralCulture },
]

const baseUrl = (import.meta as any).env?.BASE_URL || '/'

const router = createRouter({
  history: createWebHistory(baseUrl + 'admin/'),
  routes,
})

router.beforeEach(async (_to, _from, next) => {
  const { isAuthenticated, isAdmin, refreshAuth } = useAuth()

  if (isAuthenticated.value) {
    await refreshAuth()
  }

  if (!isAuthenticated.value || !isAdmin.value) {
    window.location.href = '/'
    return
  }

  next()
})

export default router
