import { createRouter, createWebHistory } from 'vue-router'
import CategoriesGrid from '@components/lexique/CategoriesGrid.vue'
import Category from '@components/lexique/Category.vue'
import Persons from '@components/culture/Persons.vue'
import PersonDetail from '@components/culture/PersonDetail.vue'

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
            component: Persons,
            props: true,
          },
        ],
      },
    ],
  },
  {
    path: '/person/:slug',
    component: PersonDetail,
    props: true,
  },
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL + 'culture'),
  routes,
})
