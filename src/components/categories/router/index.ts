import { createRouter, createWebHistory } from 'vue-router'
import CategoriesGrid from '@components/categories/CategoriesGrid.vue'
import Category from '@components/categories/Category.vue'
import Signs from '@components/categories/Signs.vue'

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
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL + 'categories'),
  routes,
})
