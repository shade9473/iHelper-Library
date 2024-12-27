import fs from 'fs';
import path from 'path';

console.log('🔍 Starting Diagnostic Process');

// Print current working directory
console.log('Current Working Directory:', process.cwd());

// Check project structure
const projectRoot = path.resolve(process.cwd());
const srcDir = path.join(projectRoot, 'src');

console.log('Project Root:', projectRoot);
console.log('Source Directory:', srcDir);

// List contents of source directory
try {
  const srcContents = fs.readdirSync(srcDir);
  console.log('Source Directory Contents:', srcContents);
} catch (error) {
  console.error('Error reading source directory:', error);
}

// Check specific files
const filesToCheck = [
  'services/ContentLoader.js',
  'utils/Logger.js'
];

filesToCheck.forEach(file => {
  const fullPath = path.join(srcDir, file);
  try {
    const stats = fs.statSync(fullPath);
    console.log(`✅ File exists: ${file}`);
    console.log(`File Size: ${stats.size} bytes`);
  } catch (error) {
    console.error(`❌ File not found: ${file}`);
  }
});

console.log('🏁 Diagnostic Complete');
