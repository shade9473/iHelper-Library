import ContentMapper from './content-mapper.js';

const contentMapper = new ContentMapper('/');
const categorySummary = contentMapper.getCategorySummary();
const searchIndex = contentMapper.buildSearchIndex();

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search resources..."]');
    const searchResults = document.getElementById('search-results');
    const categoriesContainer = document.getElementById('categories');
    const resourceViewerModal = document.getElementById('resource-viewer');
    const resourceViewerContent = document.getElementById('resource-viewer-content');
    const closeModalButton = document.getElementById('close-modal');

    // Populate Categories with Functional Links
    categorySummary.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.classList.add('category-card');
        categoryElement.innerHTML = `
            <h3>${category.name.replace(/_/g, ' ')}</h3>
            <span>${category.itemCount} resources</span>
        `;
        categoryElement.addEventListener('click', () => showCategoryResources(category.name));
        categoriesContainer.appendChild(categoryElement);
    });

    function showCategoryResources(categoryName) {
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
    }

    function showResourceContent(categoryName, resourceTitle) {
        const content = contentMapper.getResourceContent(categoryName, resourceTitle);
        if (content) {
            resourceViewerContent.innerHTML = `
                <h2>${resourceTitle}</h2>
                <p>${content}</p>
            `;
            resourceViewerModal.classList.remove('hidden');
        }
    }

    // Search Functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        
        if (searchTerm.length > 2) {
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
        } else {
            searchResults.innerHTML = '';
        }
    });

    // Close modal
    closeModalButton.addEventListener('click', () => {
        resourceViewerModal.classList.add('hidden');
    });

    // Initial load: show default category
    if (categorySummary.length > 0) {
        showCategoryResources(categorySummary[0].name);
    }
});

// Smooth Scroll Polyfill
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Analytics and Performance Tracking
window.addEventListener('load', () => {
    console.log('Page fully loaded');
    // Future: Implement performance metrics and logging
});
