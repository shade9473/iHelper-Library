# Content Migration System Guide
Last Updated: 2024-12-23 00:11 PST

## 🚀 Quick Start

```bash
# Run content migration
node scripts/content-migration.js
```

## 📁 Directory Structure

```
content/
├── source/        # Original content files
├── processed/     # Transformed content
├── backups/       # Automatic backups
└── metadata/      # Migration metadata
```

## ⚙️ Configuration

### Default Settings
```javascript
{
  sourcePath: '../content/source',
  targetPath: '../content/processed',
  backupPath: '../content/backups',
  metadataPath: '../content/metadata',
  validExtensions: ['.md', '.mdx', '.txt', '.html'],
  validateContent: true,
  createBackups: true,
  generateMetadata: true
}
```

## 🔍 Content Validation

### Validation Checks
1. Content length (minimum 100 characters)
2. Markdown syntax (for .md files)
3. Empty content detection
4. TODO/FIXME markers
5. Required front matter

## 🔄 Content Transformations

### Markdown (.md, .mdx)
- Adds front matter if missing
- Validates markdown syntax
- Converts to HTML

### Plain Text (.txt)
- Converts to markdown format
- Adds title based on filename

### HTML (.html)
- Removes scripts and styles
- Sanitizes content

## 📊 Migration Statistics

### Tracked Metrics
- Files processed
- Success/failure rate
- Processing warnings
- Backup creation
- Processing speed

### Example Summary
```
📊 Migration Summary
==================
Total Files: 100
Successfully Processed: 98
Failed: 2
Warnings: 5
Backups Created: 98
Duration: 12.34s
Average Speed: 7.94 files/s
```

## 🗄️ Metadata Structure

```json
{
  "timestamp": "2024-12-23T08:11:36.789Z",
  "stats": {
    "processed": 98,
    "failed": 2,
    "warnings": 5,
    "backups": 98,
    "startTime": "2024-12-23T08:11:24.456Z",
    "endTime": "2024-12-23T08:11:36.789Z"
  },
  "files": [
    {
      "path": "relative/path/to/file.md",
      "hash": "sha256-hash",
      "size": 1234,
      "processedSize": 2345,
      "lastModified": "2024-12-23T08:11:30.123Z",
      "validationIssues": [],
      "backupPath": "path/to/backup.bak"
    }
  ]
}
```

## 🔐 Best Practices

1. **Before Migration**
   - Verify source content
   - Check disk space
   - Test on sample content

2. **During Migration**
   - Monitor progress
   - Check logs
   - Verify transformations

3. **After Migration**
   - Validate output
   - Review metadata
   - Test processed content

## 🚨 Required Actions

1. **Setup Content Directories**
   ```bash
   mkdir -p content/{source,processed,backups,metadata}
   ```

2. **Prepare Source Content**
   - Move content to `content/source`
   - Verify file extensions
   - Check content format

3. **Run Migration**
   ```bash
   node scripts/content-migration.js
   ```

4. **Verify Results**
   - Check processed content
   - Review metadata files
   - Verify backups

## 📝 Maintenance Tasks

### Daily
- Monitor migration logs
- Verify backup integrity
- Check processing errors

### Weekly
- Clean old backups
- Update content rules
- Review validation rules

### Monthly
- Full content audit
- Update documentation
- Optimize transformations

## 🔄 Recovery Process

1. **Restore from Backup**
   ```bash
   cp content/backups/[filename].bak content/source/[filename]
   ```

2. **Verify Restoration**
   ```bash
   diff content/source/[filename] content/backups/[filename].bak
   ```

3. **Reprocess Content**
   ```bash
   node scripts/content-migration.js
   ```

## 📈 Progress Tracking

### Phase Completion
- [ ] Content Inventory (0%)
- [ ] Directory Setup (100%)
- [ ] Initial Migration (0%)
- [ ] Validation (0%)
- [ ] Final Verification (0%)

### Overall Progress: 20%
