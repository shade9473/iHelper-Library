import { createRouter, createWebHistory } from 'vue-router'
import ResourceLibrary from '@/views/ResourceLibrary.vue'
import ResourceDetail from '@/views/ResourceDetail.vue'
import NotFound from '@/views/NotFound.vue'

const routes = [
  { 
    path: '/', 
    name: 'Home', 
    component: ResourceLibrary 
  },
  {
    path: '/resource/:type/:id',
    name: 'ResourceDetail',
    component: ResourceDetail,
    props: true
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
