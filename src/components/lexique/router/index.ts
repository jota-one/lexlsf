import { createRouter, createWebHistory } from 'vue-router'
import CategoriesGrid from '@components/lexique/CategoriesGrid.vue'
import Category from '@components/lexique/Category.vue'
import Signs from '@components/lexique/Signs.vue'
import SignDetail from '@components/lexique/SignDetail.vue'

const routes = [
  {
    path: '',
    component: CategoriesGrid,
    children: [
      {
        path: ':category',
        component: Category,
        props: true,
        children: [
          {
            path: ':subcategory',
            component: Signs,
            props: true,
          },
        ],
      },
    ],
  },
  {
    path: '/sign/:slug',
    component: SignDetail,
    props: true,
  },
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL + 'lexique'),
  routes,
})
