const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

class ContentAuditor {
  constructor(contentDir) {
    this.contentDir = contentDir;
    this.auditResults = {
      totalResources: 0,
      categories: {},
      qualityScores: {
        excellent: 0,
        good: 0,
        needsImprovement: 0,
        requireRewrite: 0
      }
    };
  }

  async performAudit() {
    console.log('🔍 Starting Content Audit');
    await this.traverseContentDirectory(this.contentDir);
    this.generateAuditReport();
  }

  async traverseContentDirectory(dir) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await this.traverseContentDirectory(fullPath);
      } else if (path.extname(entry.name) === '.md') {
        await this.auditResource(fullPath);
      }
    }
  }

  async auditResource(filePath) {
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      const parsedContent = matter(fileContent);
      const score = this.calculateResourceScore(parsedContent);

      this.updateAuditResults(filePath, score);
    } catch (error) {
      console.error(`Error auditing ${filePath}:`, error);
    }
  }

  calculateResourceScore(parsedContent) {
    const metadata = parsedContent.data;
    const content = parsedContent.content;

    let score = 0;

    // Relevance Check
    if (metadata.tags && metadata.tags.length > 0) score++;
    if (content.length > 100) score++;

    // Technical Accuracy Check
    if (metadata.last_updated) score++;
    if (content.includes('```')) score++;  // Code examples

    // Formatting Check
    if (content.split('\n').some(line => line.startsWith('## '))) score++;
    if (content.includes('- ')) score++;

    // Depth Check
    if (content.includes('### ')) score++;
    if (content.toLowerCase().includes('example')) score++;

    return score;
  }

  updateAuditResults(filePath, score) {
    this.auditResults.totalResources++;

    const category = path.basename(path.dirname(filePath));
    this.auditResults.categories[category] = 
      (this.auditResults.categories[category] || 0) + 1;

    if (score >= 6) this.auditResults.qualityScores.excellent++;
    else if (score >= 4) this.auditResults.qualityScores.good++;
    else if (score >= 2) this.auditResults.qualityScores.needsImprovement++;
    else this.auditResults.qualityScores.requireRewrite++;
  }

  generateAuditReport() {
    const reportPath = path.join(this.contentDir, 'CONTENT_AUDIT_REPORT.md');
    const reportContent = `# 📊 Content Audit Report

## 🔢 Resource Statistics
- **Total Resources**: ${this.auditResults.totalResources}

## 📁 Category Distribution
${Object.entries(this.auditResults.categories)
  .map(([category, count]) => `- ${category}: ${count} resources`)
  .join('\n')}

## 🌟 Quality Scores
- **Excellent Resources**: ${this.auditResults.qualityScores.excellent}
- **Good Resources**: ${this.auditResults.qualityScores.good}
- **Needs Improvement**: ${this.auditResults.qualityScores.needsImprovement}
- **Requires Rewrite**: ${this.auditResults.qualityScores.requireRewrite}

## 📈 Quality Percentage
- Excellent/Good: ${
  ((this.auditResults.qualityScores.excellent + this.auditResults.qualityScores.good) / 
   this.auditResults.totalResources * 100).toFixed(2)
}%

## 🚨 Recommendations
1. Review resources in "Needs Improvement" and "Requires Rewrite" categories
2. Update outdated content
3. Add more practical examples
4. Ensure consistent formatting
`;

    fs.writeFileSync(reportPath, reportContent);
    console.log('✅ Audit Report Generated');
  }
}

// Usage
const contentDir = path.join(__dirname, '..', 'content');
const auditor = new ContentAuditor(contentDir);
auditor.performAudit();
