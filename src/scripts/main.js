import ContentMapper from './content-mapper.js';

const contentMapper = new ContentMapper('/path/to/project/root');
const categorySummary = contentMapper.getCategorySummary();
const searchIndex = contentMapper.buildSearchIndex();

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder="Search resources..."]');
    const searchResults = document.getElementById('search-results');
    const categoriesContainer = document.getElementById('categories');
    const resourceViewerModal = document.getElementById('resource-viewer');
    const resourceViewerContent = document.getElementById('resource-viewer-content');

    // Populate Categories
    categorySummary.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.classList.add('category-card');
        categoryElement.innerHTML = `
            <h3>${category.name}</h3>
            <span>${category.itemCount} resources</span>
        `;
        categoryElement.addEventListener('click', () => showCategoryResources(category.name));
        categoriesContainer.appendChild(categoryElement);
    });

    function showCategoryResources(categoryName) {
        const category = contentMapper.categories.find(c => c.name === categoryName);
        searchResults.innerHTML = category.items.map(resource => `
            <div class="resource-item" data-category="${categoryName}" data-title="${resource.title}">
                ${resource.title}
            </div>
        `).join('');

        // Add click listeners to resource items
        document.querySelectorAll('.resource-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                const title = item.dataset.title;
                showResourceContent(category, title);
            });
        });
    }

    function showResourceContent(categoryName, resourceTitle) {
        const content = contentMapper.getResourceContent(categoryName, resourceTitle);
        if (content) {
            resourceViewerContent.innerHTML = content;
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
                    ${result.title} (${result.category})
                </div>
            `).join('');

            // Add click listeners to search results
            document.querySelectorAll('.search-result').forEach(item => {
                item.addEventListener('click', () => {
                    const category = item.dataset.category;
                    const title = item.dataset.title;
                    showResourceContent(category, title);
                });
            });
        } else {
            searchResults.innerHTML = '';
        }
    });

    // Close modal
    document.getElementById('close-modal').addEventListener('click', () => {
        resourceViewerModal.classList.add('hidden');
    });
});

// Smooth Scroll Polyfill
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Analytics and Performance Tracking (Placeholder)
window.addEventListener('load', () => {
    console.log('Page fully loaded');
    // Future: Implement performance metrics and logging
});
