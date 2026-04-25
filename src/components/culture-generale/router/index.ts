import { createRouter, createWebHistory } from 'vue-router'
import CultureGeneraleLayout from '@components/culture-generale/CultureGeneraleLayout.vue'
import CultureGeneraleDetail from '@components/culture-generale/CultureGeneraleDetail.vue'

const routes = [
  {
    path: '',
    component: CultureGeneraleLayout,
    children: [
      {
        path: ':slug',
        component: CultureGeneraleDetail,
        props: true,
      },
    ],
  },
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL + 'culture-generale'),
  routes,
})
