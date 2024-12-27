import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';
import os from 'os';
import v8 from 'v8';
import MarkdownParser from '../src/utils/MarkdownParser.js';
import ContentLoaderModule from '../src/services/ContentLoader.js';

class PerformanceBenchmark {
  constructor() {
    this.results = {
      systemInfo: this.getSystemInfo(),
      benchmarks: {}
    };
  }

  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().map(cpu => ({
        model: cpu.model,
        speed: cpu.speed
      })),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      nodeVersion: process.version
    };
  }

  async benchmarkContentLoading() {
    const start = performance.now();
    try {
      await ContentLoaderModule.loadDirectoryStructure();
      const end = performance.now();

      return {
        name: 'Content Loading',
        duration: end - start,
        memoryUsed: process.memoryUsage().heapUsed,
        status: 'success'
      };
    } catch (error) {
      return {
        name: 'Content Loading',
        duration: 0,
        memoryUsed: process.memoryUsage().heapUsed,
        status: 'failed',
        error: error.message
      };
    }
  }

  async benchmarkSearchPerformance() {
    try {
      await ContentLoaderModule.loadDirectoryStructure();

      const start = performance.now();
      const searchResults = ContentLoaderModule.searchContent('performance');
      const end = performance.now();

      return {
        name: 'Content Search',
        duration: end - start,
        resultsCount: searchResults.length,
        memoryUsed: process.memoryUsage().heapUsed,
        status: 'success'
      };
    } catch (error) {
      return {
        name: 'Content Search',
        duration: 0,
        resultsCount: 0,
        memoryUsed: process.memoryUsage().heapUsed,
        status: 'failed',
        error: error.message
      };
    }
  }

  async benchmarkResourceParsing() {
    const testMarkdown = `
# Test Performance
## Benchmark Content

This is a sample markdown file for performance testing.
Multiple lines to simulate real-world parsing.
`;

    const start = performance.now();
    const parsedContent = await MarkdownParser.extractMetadata(testMarkdown);
    const end = performance.now();

    return {
      name: 'Markdown Parsing',
      duration: end - start,
      contentLength: testMarkdown.length,
      memoryUsed: process.memoryUsage().heapUsed,
      status: 'success'
    };
  }

  async runBenchmarks() {
    this.results.benchmarks = {
      contentLoading: await this.benchmarkContentLoading(),
      searchPerformance: await this.benchmarkSearchPerformance(),
      resourceParsing: await this.benchmarkResourceParsing()
    };

    this.results.v8HeapStats = v8.getHeapStatistics();
    
    return this.results;
  }

  generateReport() {
    return JSON.stringify(this.results, null, 2);
  }

  saveReport(reportPath) {
    const reportContent = this.generateReport();
    fs.writeFileSync(reportPath, reportContent);
    console.log(`Performance baseline report saved to ${reportPath}`);
  }
}

async function main() {
  const benchmark = new PerformanceBenchmark();
  const results = await benchmark.runBenchmarks();
  
  const reportPath = path.join(
    process.cwd(), 
    'performance-baseline-' + new Date().toISOString().replace(/:/g, '-') + '.json'
  );
  
  benchmark.saveReport(reportPath);
  console.log('Benchmark Results:', results);
}

main().catch(console.error);
