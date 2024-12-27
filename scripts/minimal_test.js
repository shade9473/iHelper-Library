console.log('Starting minimal test');

async function testImport() {
  try {
    console.log('Attempting to import ContentLoader');
    const ContentLoaderModule = await import('../src/services/ContentLoader.js');
    console.log('ContentLoader imported successfully');
    
    const ContentLoader = ContentLoaderModule.default;
    console.log('Attempting to load directory structure');
    
    const categories = await ContentLoader.loadDirectoryStructure();
    console.log(`Loaded ${categories.length} categories`);
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testImport();
