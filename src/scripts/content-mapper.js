import Fuse from 'fuse.js';

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
    constructor(resourceData) {
        this.startTime = Date.now();
        
        try {
            this.searchIndex = this.buildSearchIndex(resourceData);
            this.fuse = new Fuse(this.searchIndex, {
                keys: ['title', 'content', 'category'],
                threshold: 0.4
            });

            const indexingTime = Date.now() - this.startTime;
            Logger.log('INFO', 'ContentMapper', 'Resource indexing completed', {
                totalResources: this.searchIndex.length,
                indexingTime: `${indexingTime}ms`
            });
        } catch (error) {
            Logger.log('ERROR', 'ContentMapper', 'Initialization failed', {
                error: error.message
            });
        }
    }

    buildSearchIndex(resourceData) {
        return resourceData.map(resource => ({
            id: resource.id,
            title: resource.title,
            content: resource.content,
            category: resource.category || 'Uncategorized'
        }));
    }

    search(query) {
        if (!query || query.trim() === '') return [];
        
        const results = this.fuse.search(query);
        return results.map(result => result.item);
    }
}

export default ContentMapper;
