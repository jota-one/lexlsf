import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Categories from "../views/Categories.vue";
import Signs from "../views/Signs.vue";
import HandConfigurations from "../views/HandConfigurations.vue";
import Persons from "../views/Persons.vue";

const routes = [
  { path: "", component: Home },
  { path: "/categories", component: Categories },
  { path: "/signs", component: Signs },
  { path: "/hand-configurations", component: HandConfigurations },
  { path: "/persons", component: Persons },
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL + "admin/"),
  routes,
});
