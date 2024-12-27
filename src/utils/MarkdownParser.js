import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';

class MarkdownParser {
  constructor(baseContentPath) {
    this.baseContentPath = baseContentPath || path.resolve(process.cwd(), 'content');
  }

  async parseMarkdownFile(filePath) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const parsedContent = this.extractMetadata(fileContent);
      
      return {
        ...parsedContent,
        html: marked.parse(parsedContent.content),
        originalMarkdown: fileContent
      };
    } catch (error) {
      console.error(`Error parsing markdown file ${filePath}:`, error);
      return null;
    }
  }

  extractMetadata(markdown) {
    const metadataRegex = /^---\n([\s\S]*?)\n---/;
    const metadataMatch = markdown.match(metadataRegex);
    
    let metadata = {};
    let content = markdown;

    if (metadataMatch) {
      const metadataStr = metadataMatch[1];
      metadata = this.parseYAMLMetadata(metadataStr);
      content = markdown.replace(metadataRegex, '').trim();
    }

    return {
      ...metadata,
      content,
      readTime: this.calculateReadTime(content)
    };
  }

  parseYAMLMetadata(metadataStr) {
    const metadata = {};
    metadataStr.split('\n').forEach(line => {
      const [key, value] = line.split(':').map(part => part.trim());
      if (key && value) {
        metadata[key] = value.replace(/^['"]|['"]$/g, '');
      }
    });
    return metadata;
  }

  calculateReadTime(content, wordsPerMinute = 200) {
    const wordCount = content.split(/\s+/).length;
    const readTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
    return `${readTimeMinutes} min read`;
  }

  async listMarkdownFiles(directory) {
    const fullPath = path.join(this.baseContentPath, directory);
    try {
      const files = await fs.readdir(fullPath);
      return files
        .filter(file => path.extname(file).toLowerCase() === '.md')
        .map(file => path.join(fullPath, file));
    } catch (error) {
      console.error(`Error listing markdown files in ${directory}:`, error);
      return [];
    }
  }
}

export default new MarkdownParser();
