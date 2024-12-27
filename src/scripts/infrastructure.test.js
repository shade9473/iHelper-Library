import { describe, it, expect } from 'vitest';
import ContentMapper from './content-mapper.js';

describe('Test Infrastructure Validation', () => {
  it('confirms module system compatibility', () => {
    expect(true).toBe(true);
  });

  it('can import ContentMapper', () => {
    const mapper = new ContentMapper();
    expect(mapper).toBeDefined();
  });

  it('validates category summary generation', () => {
    const mapper = new ContentMapper();
    const categorySummary = mapper.getCategorySummary();
    
    expect(categorySummary).toBeTruthy();
    expect(Array.isArray(categorySummary)).toBe(true);
    expect(categorySummary.length).toBeGreaterThan(0);
    
    categorySummary.forEach(category => {
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('itemCount');
    });
  });
});
