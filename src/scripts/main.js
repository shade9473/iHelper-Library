import ContentMapper from './content-mapper.js';

const contentMapper = new ContentMapper('/');
const categorySummary = contentMapper.getCategorySummary();
const searchIndex = contentMapper.buildSearchIndex();

document.addEventListener('DOMContentLoaded', () => {
    // Error Handling for DOM Elements
    const searchInput = document.querySelector('input[placeholder="Search resources..."]');
    const searchResults = document.getElementById('search-results');
    const categoriesContainer = document.getElementById('categories');
    const resourceViewerModal = document.getElementById('resource-viewer');
    const resourceViewerContent = document.getElementById('resource-viewer-content');
    const closeModalButton = document.getElementById('close-modal');

    // Comprehensive Error Logging
    const logError = (component, message) => {
        console.error(`[${component}] ${message}`);
        // Future: Could send to a logging service
    };

    // Validate Critical DOM Elements
    if (!searchInput) logError('Search', 'Search input not found');
    if (!searchResults) logError('Search Results', 'Search results container not found');
    if (!categoriesContainer) logError('Categories', 'Categories container not found');
    if (!resourceViewerModal) logError('Resource Viewer', 'Modal not found');
    if (!resourceViewerContent) logError('Resource Viewer', 'Modal content area not found');
    if (!closeModalButton) logError('Modal', 'Close button not found');

    // Graceful Degradation
    const safePopulateCategories = () => {
        try {
            categorySummary.forEach(category => {
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
    if (categorySummary.length > 0) {
        safeShowCategoryResources(categorySummary[0].name);
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
