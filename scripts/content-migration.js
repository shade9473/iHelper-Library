const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const marked = require('marked');

class ContentMigration {
  constructor() {
    this.config = {
      sourcePath: path.join(__dirname, '../content/source'),
      targetPath: path.join(__dirname, '../content/processed'),
      backupPath: path.join(__dirname, '../content/backups'),
      metadataPath: path.join(__dirname, '../content/metadata'),
      validExtensions: ['.md', '.mdx', '.txt', '.html'],
      validateContent: true,
      createBackups: true,
      generateMetadata: true
    };

    this.stats = {
      processed: 0,
      failed: 0,
      warnings: 0,
      backups: 0,
      startTime: null,
      endTime: null
    };

    this.metadata = new Map();
  }

  async initialize() {
    await Promise.all([
      fs.mkdir(this.config.sourcePath, { recursive: true }),
      fs.mkdir(this.config.targetPath, { recursive: true }),
      fs.mkdir(this.config.backupPath, { recursive: true }),
      fs.mkdir(this.config.metadataPath, { recursive: true })
    ]);

    this.stats.startTime = new Date();
    console.log('🚀 Content Migration System Initialized');
  }

  generateHash(content) {
    return crypto
      .createHash('sha256')
      .update(content)
      .digest('hex');
  }

  async validateContent(content, filePath) {
    const issues = [];
    
    // Check for empty content
    if (!content.trim()) {
      issues.push('Content is empty');
    }

    // Check for broken markdown (if markdown file)
    if (path.extname(filePath) === '.md') {
      try {
        marked.parse(content);
      } catch (error) {
        issues.push(`Invalid markdown: ${error.message}`);
      }
    }

    // Check for minimum content length
    if (content.length < 100) {
      issues.push('Content length below minimum (100 characters)');
    }

    // Check for common formatting issues
    if (content.includes('TODO') || content.includes('FIXME')) {
      issues.push('Contains TODO or FIXME markers');
    }

    return issues;
  }

  async processFile(filePath) {
    const relativePath = path.relative(this.config.sourcePath, filePath);
    console.log(`Processing: ${relativePath}`);

    try {
      // Read source file
      const content = await fs.readFile(filePath, 'utf8');
      const contentHash = this.generateHash(content);

      // Validate content
      if (this.config.validateContent) {
        const issues = await this.validateContent(content, filePath);
        if (issues.length > 0) {
          this.stats.warnings++;
          console.warn(`⚠️ Validation issues in ${relativePath}:`);
          issues.forEach(issue => console.warn(`  - ${issue}`));
        }
      }

      // Create backup
      if (this.config.createBackups) {
        const backupFile = path.join(
          this.config.backupPath,
          `${relativePath}.${Date.now()}.bak`
        );
        await fs.mkdir(path.dirname(backupFile), { recursive: true });
        await fs.writeFile(backupFile, content);
        this.stats.backups++;
      }

      // Process content
      const processedContent = await this.transformContent(content, filePath);
      
      // Write processed file
      const targetFile = path.join(this.config.targetPath, relativePath);
      await fs.mkdir(path.dirname(targetFile), { recursive: true });
      await fs.writeFile(targetFile, processedContent);

      // Generate metadata
      if (this.config.generateMetadata) {
        const metadata = {
          path: relativePath,
          hash: contentHash,
          size: content.length,
          processedSize: processedContent.length,
          lastModified: new Date().toISOString(),
          validationIssues: issues || [],
          backupPath: backupFile
        };

        this.metadata.set(relativePath, metadata);
      }

      this.stats.processed++;
      return true;
    } catch (error) {
      this.stats.failed++;
      console.error(`❌ Failed to process ${relativePath}:`, error);
      return false;
    }
  }

  async transformContent(content, filePath) {
    // Transform based on file type
    const ext = path.extname(filePath);
    
    switch (ext) {
      case '.md':
      case '.mdx':
        return this.transformMarkdown(content);
      case '.txt':
        return this.transformText(content);
      case '.html':
        return this.transformHtml(content);
      default:
        return content;
    }
  }

  async transformMarkdown(content) {
    // Add front matter if not present
    if (!content.startsWith('---')) {
      content = `---\ndate: ${new Date().toISOString()}\n---\n\n${content}`;
    }

    // Process markdown
    return marked.parse(content);
  }

  async transformText(content) {
    // Convert plain text to markdown
    return `# ${path.basename(filePath, '.txt')}\n\n${content}`;
  }

  async transformHtml(content) {
    // Clean HTML
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  }

  async saveMetadata() {
    const metadataFile = path.join(
      this.config.metadataPath,
      `migration-${Date.now()}.json`
    );

    const metadata = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      files: Array.from(this.metadata.values())
    };

    await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2));
    console.log(`📝 Metadata saved to ${metadataFile}`);
  }

  async migrate() {
    console.log('🚀 Starting content migration');
    await this.initialize();

    // Get all content files
    const files = await this.getContentFiles(this.config.sourcePath);
    console.log(`Found ${files.length} files to process`);

    // Process files
    for (const file of files) {
      await this.processFile(file);
    }

    this.stats.endTime = new Date();
    await this.saveMetadata();

    // Print summary
    this.printSummary();
  }

  async getContentFiles(dir) {
    const files = [];
    
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        files.push(...await this.getContentFiles(fullPath));
      } else if (this.config.validExtensions.includes(path.extname(item.name))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  printSummary() {
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;
    
    console.log('\n📊 Migration Summary');
    console.log('==================');
    console.log(`Total Files: ${this.stats.processed + this.stats.failed}`);
    console.log(`Successfully Processed: ${this.stats.processed}`);
    console.log(`Failed: ${this.stats.failed}`);
    console.log(`Warnings: ${this.stats.warnings}`);
    console.log(`Backups Created: ${this.stats.backups}`);
    console.log(`Duration: ${duration.toFixed(2)}s`);
    console.log(`Average Speed: ${(this.stats.processed / duration).toFixed(2)} files/s`);
  }
}

// Start migration if run directly
if (require.main === module) {
  const migrator = new ContentMigration();
  migrator.migrate().catch(console.error);
}

module.exports = ContentMigration;
