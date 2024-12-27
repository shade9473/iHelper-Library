import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { seoManager } from '@/plugins/seo'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/HomePage.vue'),
        beforeEnter: () => {
          seoManager.setMetadata({
            title: 'iHelper Resource Library - Learn, Grow, Succeed',
            description: 'Your comprehensive platform for learning, personal development, and entrepreneurial success.',
            keywords: [
              'learning resources', 
              'startup guides', 
              'personal development', 
              'tutorials', 
              'entrepreneurship'
            ]
          })
        }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/CategoriesPage.vue'),
        beforeEnter: () => {
          seoManager.setMetadata({
            title: 'Resource Categories - iHelper Library',
            description: 'Explore our curated collection of learning resources across various categories.',
            keywords: [
              'resource categories', 
              'learning paths', 
              'skill development', 
              'knowledge base'
            ]
          })
        }
      },
      {
        path: 'categories/:categoryId',
        name: 'CategoryDetail',
        component: () => import('@/views/CategoryDetailPage.vue'),
        beforeEnter: (to) => {
          seoManager.setMetadata({
            title: `${to.params.categoryId} Resources - iHelper Library`,
            description: `Explore in-depth resources and tutorials in the ${to.params.categoryId} category.`
          })
        }
      },
      {
        path: 'resources',
        name: 'Resources',
        component: () => import('@/views/ResourcesPage.vue'),
        beforeEnter: () => {
          seoManager.setMetadata({
            title: 'Resource Library - iHelper',
            description: 'A comprehensive collection of learning resources for professionals and entrepreneurs.',
            keywords: [
              'resource library', 
              'learning resources', 
              'professional development', 
              'tutorials', 
              'guides'
            ]
          })
        }
      },
      {
        path: 'resources/:categoryId/:resourceId',
        name: 'ResourceDetail',
        component: () => import('@/views/ResourceDetailPage.vue'),
        beforeEnter: (to, from, next) => {
          // Dynamic SEO based on resource metadata
          const resourceId = `${to.params.categoryId}/${to.params.resourceId}.md`
          const resourceStore = useResourceStore()
          const resource = resourceStore.resources[resourceId]
          
          if (resource) {
            seoManager.setMetadata({
              title: `${resource.title} - iHelper Library`,
              description: resource.description,
              keywords: resource.tags
            })
          }
          
          next()
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
    beforeEnter: () => {
      seoManager.setMetadata({
        title: 'Page Not Found - iHelper Library',
        description: 'The page you are looking for does not exist.'
      })
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
