import Fuse from 'fuse.js';
import { marked } from 'marked';

class Logger {
    static log(level, component, message, metadata = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            component,
            message,
            metadata
        };
        console[level.toLowerCase()](JSON.stringify(logEntry));
    }
}

class ContentMapper {
    constructor(rootDir = '/') {
        this.rootDir = rootDir;
        this.startTime = Date.now();
        
        try {
            this.categories = this.loadCategories();
            this.searchIndex = this.buildSearchIndex();
            this.fuse = new Fuse(this.searchIndex, {
                keys: ['title', 'content', 'category'],
                threshold: 0.4
            });

            const indexingTime = Date.now() - this.startTime;
            Logger.log('INFO', 'ContentMapper', 'Resource indexing completed', {
                totalCategories: this.categories.length,
                totalResources: this.searchIndex.length,
                indexingTime: `${indexingTime}ms`
            });
        } catch (error) {
            Logger.log('ERROR', 'ContentMapper', 'Initialization failed', {
                error: error.message
            });
        }
    }

    loadCategories() {
        // Dynamically generate categories based on directory structure
        const predefinedCategories = [
            {
                name: '01_Welcome_Message',
                path: '/01_Welcome_Message',
                resources: [
                    { 
                        title: 'Welcome to iHelper Resource Library', 
                        content: 'A comprehensive platform designed to support professionals in their growth journey.',
                        link: '/01_Welcome_Message/README.md'
                    }
                ]
            },
            {
                name: '04_Quick_Start_Guides',
                path: '/04_Quick_Start_Guides',
                resources: [
                    { 
                        title: 'Getting Started with iHelper', 
                        content: 'Quick and easy guide to navigate and utilize the resource library effectively.',
                        link: '/04_Quick_Start_Guides/README.md'
                    }
                ]
            },
            {
                name: '05_AI_Assistant_Tutorials',
                path: '/05_AI_Assistant_Tutorials',
                resources: [
                    { 
                        title: 'AI Assistant Basics', 
                        content: 'Learn how to leverage AI assistants for professional development.',
                        link: '/05_AI_Assistant_Tutorials/README.md'
                    }
                ]
            },
            {
                name: '09_Workflow_Automation',
                path: '/09_Workflow_Automation',
                resources: [
                    { 
                        title: 'Workflow Automation Strategies', 
                        content: 'Techniques to streamline and optimize your professional workflows.',
                        link: '/09_Workflow_Automation/README.md'
                    }
                ]
            },
            {
                name: '36_Personal_Development',
                path: '/36_Personal_Development',
                resources: [
                    { 
                        title: 'Personal Growth Roadmap', 
                        content: 'Comprehensive strategies for continuous personal and professional development.',
                        link: '/36_Personal_Development/README.md'
                    }
                ]
            }
        ];

        try {
            // In a real-world scenario, this would use file system APIs or dynamic import
            // For now, we'll keep the predefined categories
            return predefinedCategories;
        } catch (error) {
            Logger.log('WARN', 'CategoryLoader', 'Failed to dynamically load categories', {
                error: error.message
            });
            return predefinedCategories;
        }
    }

    buildSearchIndex() {
        const index = [];
        this.categories.forEach(category => {
            category.resources.forEach(resource => {
                index.push({
                    title: resource.title,
                    content: resource.content,
                    category: category.name,
                    link: resource.link
                });
            });
        });
        return index;
    }

    search(query) {
        const searchStart = Date.now();
        const results = this.fuse.search(query).map(result => result.item);
        const searchTime = Date.now() - searchStart;

        Logger.log('INFO', 'ContentMapper', 'Search performed', {
            query,
            resultCount: results.length,
            searchTime: `${searchTime}ms`
        });

        return results;
    }

    getCategorySummary() {
        return this.categories.map(category => ({
            name: category.name,
            itemCount: category.resources.length
        }));
    }

    getResourceContent(categoryName, resourceTitle) {
        const category = this.categories.find(cat => cat.name === categoryName);
        if (category) {
            const resource = category.resources.find(res => res.title === resourceTitle);
            return resource ? resource.content : null;
        }
        return null;
    }
}

export default ContentMapper;
