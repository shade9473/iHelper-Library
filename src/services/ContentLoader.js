import { ref } from 'vue';

class ContentLoader {
  constructor() {
    this.contentRoot = '/content';
    this.categories = ref([]);
  }

  loadContent() {
    try {
      const categories = [
        '01_Welcome_Message',
        '04_Quick_Start_Guides',
        '05_AI_Assistant_Tutorials',
        '09_Workflow_Automation',
        '36_Personal_Development'
      ];

      this.categories.value = categories.map(category => ({
        name: category,
        resources: [
          { name: 'sample.md', path: `/content/${category}/sample.md` }
        ]
      }));

      return this.categories.value;
    } catch (error) {
      console.error('Content loading failed', error);
      return [];
    }
  }

  getResourceContent(resourcePath) {
    // Simulated content retrieval
    return `Content for ${resourcePath}`;
  }
}

export default new ContentLoader();
