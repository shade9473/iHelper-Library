import { createRouter, createWebHistory } from 'vue-router';
import CategoryView from '../views/CategoryView.vue';
import ResourceView from '../views/ResourceView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../App.vue')
  },
  {
    path: '/category/:categoryName',
    name: 'Category',
    component: CategoryView,
    props: true
  },
  {
    path: '/resource/:categoryName/:resourceName',
    name: 'Resource',
    component: ResourceView,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
