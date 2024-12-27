import { describe, it, expect, beforeEach, vi } from 'vitest';
import ContentLoader from '../../src/services/ContentLoader';
import { generateTestData, createTestSandbox } from '../test-utils';

describe('ContentLoader Service', () => {
  let contentLoader;
  let testSandbox;

  beforeEach(() => {
    contentLoader = new ContentLoader();
    testSandbox = createTestSandbox();
  });

  it('should initialize with empty resource categories', () => {
    expect(contentLoader.resourceCategories.value).toEqual([]);
  });

  it('should load directory structure successfully', async () => {
    // Mock MarkdownParser to return test data
    const mockMarkdownParser = testSandbox.mock('../../src/utils/MarkdownParser', {
      listMarkdownFiles: vi.fn().mockResolvedValue(['file1.md', 'file2.md']),
      parseMarkdownFile: vi.fn().mockResolvedValue(generateTestData('resource'))
    });

    const result = await contentLoader.loadDirectoryStructure();
    
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
    expect(mockMarkdownParser.listMarkdownFiles).toHaveBeenCalled();
  });

  it('should build content index with proper scoring', async () => {
    const testResources = [
      generateTestData('resource'),
      { ...generateTestData('resource'), title: 'Another Test Resource' }
    ];

    contentLoader.buildContentIndex([{
      id: 'test-category',
      name: 'Test Category',
      resources: testResources
    }]);

    expect(contentLoader.contentIndex.value).toEqual(expect.any(Array));
    expect(contentLoader.fuse).toBeTruthy();
  });

  it('should perform search with relevance ranking', () => {
    const testResources = [
      generateTestData('resource'),
      { ...generateTestData('resource'), title: 'Specific Test Resource' }
    ];

    contentLoader.buildContentIndex([{
      id: 'test-category',
      name: 'Test Category',
      resources: testResources
    }]);

    const results = contentLoader.searchContent('test');
    
    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('score');
  });

  it('should filter search results by category', () => {
    const testResources = [
      generateTestData('resource'),
      { 
        ...generateTestData('resource'), 
        title: 'Category Specific Resource',
        categoryName: 'Specific Category' 
      }
    ];

    contentLoader.buildContentIndex([{
      id: 'test-category',
      name: 'Test Category',
      resources: testResources
    }]);

    const results = contentLoader.searchContent('test', { category: 'Specific Category' });
    
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('Category Specific Resource');
  });

  it('should handle empty search gracefully', () => {
    const results = contentLoader.searchContent('');
    expect(results).toEqual([]);
  });

  afterEach(() => {
    testSandbox.cleanup();
  });
});
