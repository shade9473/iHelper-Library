import fs from 'fs';
import path from 'path';
import Fuse from 'fuse.js';
import marked from 'marked';

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
    constructor(rootDir) {
        this.rootDir = rootDir;
        this.startTime = Date.now();
        
        try {
            this.categories = this.mapCategories();
            this.searchIndex = this.buildSearchIndex();
            this.fuse = new Fuse(this.searchIndex, {
                keys: ['title', 'content'],
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

    mapCategories() {
        const priorityCategories = [
            '01_Welcome_Message', 
            '04_Quick_Start_Guides', 
            '05_AI_Assistant_Tutorials', 
            '09_Workflow_Automation', 
            '36_Personal_Development'
        ];

        return priorityCategories.map(category => {
            const fullPath = path.join(this.rootDir, category);
            return {
                name: category.split('_').slice(1).join(' '),
                items: this.scanDirectory(fullPath)
            };
        });
    }

    scanDirectory(dirPath) {
        try {
            return fs.readdirSync(dirPath)
                .filter(file => file.endsWith('.md'))
                .map(file => {
                    const fullPath = path.join(dirPath, file);
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    return {
                        title: file.replace('.md', ''),
                        content: content,
                        htmlContent: marked.parse(content)
                    };
                });
        } catch (error) {
            Logger.log('ERROR', 'ContentMapper', 'Directory scan error', {
                dirPath,
                error: error.message
            });
            return [];
        }
    }

    buildSearchIndex() {
        return this.categories.flatMap(category => 
            category.items.map(item => ({
                ...item,
                category: category.name
            }))
        );
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
            itemCount: category.items.length
        }));
    }

    getResourceContent(categoryName, resourceTitle) {
        const category = this.categories.find(c => c.name === categoryName);
        if (!category) return null;

        const resource = category.items.find(item => item.title === resourceTitle);
        return resource ? resource.htmlContent : null;
    }
}

export default ContentMapper;
