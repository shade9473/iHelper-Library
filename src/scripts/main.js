import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import '../index.css'
import ContentMapper from './content-mapper.js'

// Import views
const Home = () => import('../views/Home.vue')
const Categories = () => import('../views/Categories.vue')
const LearningPaths = () => import('../views/LearningPaths.vue')
const SkillAssessment = () => import('../views/SkillAssessment.vue')
const ResourceLibrary = () => import('../views/ResourceLibrary.vue')
const ResourceDetail = () => import('../views/ResourceDetail.vue')

// Define routes
const routes = [
  { 
    path: '/', 
    name: 'Home', 
    component: ResourceLibrary 
  },
  { 
    path: '/categories', 
    name: 'Categories', 
    component: Categories 
  },
  { 
    path: '/learning-paths', 
    name: 'LearningPaths', 
    component: LearningPaths 
  },
  { 
    path: '/skill-assessment', 
    name: 'SkillAssessment', 
    component: SkillAssessment 
  },
  {
    path: '/resource/:type/:id',
    name: 'ResourceDetail',
    component: ResourceDetail
  }
]

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize content mapper
const contentMapper = new ContentMapper('/');

// Comprehensive Error Logging
const logError = (component, message) => {
    console.error(`[${component}] ${message}`);
    // Future: Could send to a logging service
};

// Validate Critical DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Error Handling for DOM Elements
    const searchInput = document.querySelector('input[placeholder="Search resources..."]');
    const searchResults = document.getElementById('search-results');
    const categoriesContainer = document.getElementById('categories');
    const resourceViewerModal = document.getElementById('resource-viewer');
    const resourceViewerContent = document.getElementById('resource-viewer-content');
    const closeModalButton = document.getElementById('close-modal');

    if (!searchInput) logError('Search', 'Search input not found');
    if (!searchResults) logError('Search Results', 'Search results container not found');
    if (!categoriesContainer) logError('Categories', 'Categories container not found');
    if (!resourceViewerModal) logError('Resource Viewer', 'Modal not found');
    if (!resourceViewerContent) logError('Resource Viewer', 'Modal content area not found');
    if (!closeModalButton) logError('Modal', 'Close button not found');

    // Graceful Degradation
    const safePopulateCategories = () => {
        try {
            contentMapper.getCategorySummary().forEach(category => {
                const categoryElement = document.createElement('div');
                categoryElement.classList.add('category-card');
                categoryElement.innerHTML = `
                    <h3>${category.name.replace(/_/g, ' ')}</h3>
                    <span>${category.itemCount} resources</span>
                `;
                categoryElement.addEventListener('click', () => showCategoryResources(category.name));
                categoriesContainer?.appendChild(categoryElement);
            });
        } catch (error) {
            logError('Category Population', `Failed to populate categories: ${error.message}`);
        }
    };

    const safeShowCategoryResources = (categoryName) => {
        try {
            const category = contentMapper.categories.find(c => c.name === categoryName);
            searchResults.innerHTML = category.resources.map(resource => `
                <div class="resource-item" 
                     data-category="${categoryName}" 
                     data-title="${resource.title}">
                    <a href="${resource.link}" target="_blank">${resource.title}</a>
                    <p>${resource.content.substring(0, 100)}...</p>
                </div>
            `).join('');

            // Add click listeners to resource items
            document.querySelectorAll('.resource-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'A') {
                        const category = item.dataset.category;
                        const title = item.dataset.title;
                        showResourceContent(category, title);
                    }
                });
            });
        } catch (error) {
            logError('Category Resources', `Failed to show category resources: ${error.message}`);
        }
    };

    const safeShowResourceContent = (categoryName, resourceTitle) => {
        try {
            const content = contentMapper.getResourceContent(categoryName, resourceTitle);
            if (content) {
                resourceViewerContent.innerHTML = `
                    <h2>${resourceTitle}</h2>
                    <p>${content}</p>
                `;
                resourceViewerModal.classList.remove('hidden');
            }
        } catch (error) {
            logError('Resource Content', `Failed to show resource content: ${error.message}`);
        }
    };

    const safeSearch = (searchTerm) => {
        try {
            const results = contentMapper.search(searchTerm);
            searchResults.innerHTML = results.map(result => `
                <div class="search-result" 
                     data-category="${result.category}" 
                     data-title="${result.title}">
                    <a href="${result.link}" target="_blank">${result.title}</a>
                    <span class="category-tag">${result.category}</span>
                    <p>${result.content.substring(0, 100)}...</p>
                </div>
            `).join('');

            // Add click listeners to search results
            document.querySelectorAll('.search-result').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'A') {
                        const category = item.dataset.category;
                        const title = item.dataset.title;
                        showResourceContent(category, title);
                    }
                });
            });
        } catch (error) {
            logError('Search', `Failed to perform search: ${error.message}`);
        }
    };

    safePopulateCategories();

    // Search Functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        
        if (searchTerm.length > 2) {
            safeSearch(searchTerm);
        } else {
            searchResults.innerHTML = '';
        }
    });

    // Close modal
    closeModalButton.addEventListener('click', () => {
        try {
            resourceViewerModal.classList.add('hidden');
        } catch (error) {
            logError('Modal', `Failed to close modal: ${error.message}`);
        }
    });

    // Initial load: show default category
    if (contentMapper.getCategorySummary().length > 0) {
        safeShowCategoryResources(contentMapper.getCategorySummary()[0].name);
    }
});

// Smooth Scroll Polyfill
function smoothScroll(target) {
    try {
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error(`Failed to smooth scroll: ${error.message}`);
    }
}

// Analytics and Performance Tracking
window.addEventListener('load', () => {
    try {
        console.log('Page fully loaded');
        // Future: Implement performance metrics and logging
    } catch (error) {
        console.error(`Failed to track page load: ${error.message}`);
    }
});

app.mount('#app')
