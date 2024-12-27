import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Manually resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('Project Root:', projectRoot);
console.log('Current Directory:', __dirname);

// Detailed file existence check
function checkFileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    console.log(` File exists: ${filePath}`);
    return true;
  } catch (error) {
    console.error(` File does not exist: ${filePath}`);
    return false;
  }
}

async function verifyContentLoading() {
  console.log(' Starting Comprehensive Content Verification Process');
  
  try {
    // Dynamically import required modules
    const ContentLoaderModule = await import('../src/services/ContentLoader.js');
    const LoggerModule = await import('../src/utils/Logger.js');

    const ContentLoader = ContentLoaderModule.default;
    const Logger = LoggerModule.default;

    console.log(' Attempting to load directory structure...');
    
    // Load directory structure
    const categories = await ContentLoader.loadDirectoryStructure();
    
    console.log(` Loaded ${categories.length} categories`);

    // Verification Checks
    const checks = [
      {
        name: 'Category Count',
        test: () => {
          const result = categories.length > 0;
          console.log(`Categories found: ${categories.length}`);
          return result;
        },
        expectedResult: true
      },
      {
        name: 'Resource Presence',
        test: () => {
          const resourceCounts = categories.map(category => category.resources.length);
          console.log('Resource counts per category:', resourceCounts);
          return categories.every(category => category.resources.length > 0);
        },
        expectedResult: true
      },
      {
        name: 'Search Functionality',
        test: () => {
          console.log('Performing search test...');
          const searchResults = ContentLoader.searchContent('guide');
          console.log(`Search results for 'guide': ${searchResults.length}`);
          return searchResults.length > 0;
        },
        expectedResult: true
      }
    ];

    // Run Checks
    const results = checks.map(check => {
      const passed = check.test();
      console.log(` ${check.name}: ${passed ? 'PASSED' : 'FAILED'}`);
      return { name: check.name, passed };
    });

    // Overall Result
    const allPassed = results.every(result => result.passed);
    
    console.log(`\n Content Verification ${allPassed ? 'SUCCESSFUL' : 'FAILED'}`);

    return allPassed;
  } catch (error) {
    console.error(' Content Verification Failed', error);
    
    // Log detailed error information
    console.error('Error Details:', {
      message: error.message,
      stack: error.stack
    });

    return false;
  }
}

// Run verification if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyContentLoading().then(result => {
    process.exit(result ? 0 : 1);
  }).catch(error => {
    console.error('Unhandled error in verification process:', error);
    process.exit(1);
  });
}

export default verifyContentLoading;
