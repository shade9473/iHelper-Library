import { createRouter, createWebHistory } from 'vue-router'
import ResourceLibrary from '@/views/ResourceLibrary.vue'
import ResourceDetail from '@/views/ResourceDetail.vue'

const routes = [
  {
    path: '/',
    name: 'ResourceLibrary',
    component: ResourceLibrary
  },
  {
    path: '/resource/:type/:id',
    name: 'ResourceDetail',
    component: ResourceDetail
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
