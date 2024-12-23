// Core Application Logic
class iHelperLibrary {
    constructor() {
        this.version = '2.0.0';
        this.init();
    }

    async init() {
        await this.loadConfiguration();
        this.setupNavigation();
        this.initializeSearch();
        this.setupAnalytics();
    }

    async loadConfiguration() {
        try {
            const response = await fetch('/config.json');
            this.config = await response.json();
            console.log('Configuration loaded:', this.config.version);
        } catch (error) {
            console.error('Failed to load configuration:', error);
        }
    }

    setupNavigation() {
        // Dynamic navigation based on content structure
        const nav = document.createElement('nav');
        nav.className = 'main-nav';
        
        // Create navigation items from directory structure
        this.config?.sections?.forEach(section => {
            const link = document.createElement('a');
            link.href = `/${section.path}`;
            link.textContent = section.title;
            nav.appendChild(link);
        });
        
        document.getElementById('app').prepend(nav);
    }

    initializeSearch() {
        // Initialize search functionality
        const searchInput = document.createElement('input');
        searchInput.type = 'search';
        searchInput.placeholder = 'Search resources...';
        searchInput.addEventListener('input', this.handleSearch.bind(this));
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.appendChild(searchInput);
        
        document.querySelector('.main-nav').after(searchContainer);
    }

    async handleSearch(event) {
        const query = event.target.value;
        if (query.length < 3) return;

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    displaySearchResults(results) {
        const resultsContainer = document.querySelector('.search-results') || 
            document.createElement('div');
        resultsContainer.className = 'search-results';
        resultsContainer.innerHTML = results.map(result => `
            <div class="result-item">
                <h3><a href="${result.path}">${result.title}</a></h3>
                <p>${result.excerpt}</p>
            </div>
        `).join('');
    }

    setupAnalytics() {
        // Initialize CloudFlare Analytics
        if (typeof window.beacon === 'undefined') {
            window.beacon = (function(e,t,n){
                function a(){var e=t.getElementsByTagName("script")[0],
                n=t.createElement("script");n.async=true;
                n.src="https://static.cloudflareinsights.com/beacon.min.js";
                e.parentNode.insertBefore(n,e)}
                if(e.addEventListener){
                    e.addEventListener("load",a,false)}else{
                    e.attachEvent("onload",a)}
            })(window,document);
        }
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.iHelper = new iHelperLibrary();
});
