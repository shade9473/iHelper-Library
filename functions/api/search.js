export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  
  // Initialize search index (in production this would be a KV store)
  const searchIndex = {
    sections: [
      { id: '04', path: '04_Quick_Start_Guides', title: 'Quick Start Guides', priority: 1 },
      { id: '09', path: '09_Workflow_Automation', title: 'Workflow Automation', priority: 1 },
      { id: '32', path: '32_Free_Tools', title: 'Free Tools', priority: 1 },
      { id: '17', path: '17_AI_Tutorials', title: 'AI Tutorials', priority: 1 }
    ],
    metadata: {
      lastUpdated: new Date().toISOString(),
      totalSections: 45,
      searchableContent: true
    }
  };

  // Basic search implementation
  const results = searchIndex.sections.filter(section => {
    const searchString = `${section.path} ${section.title}`.toLowerCase();
    return searchString.includes(query.toLowerCase());
  });

  // Add analytics event (in production this would use actual analytics)
  const searchEvent = {
    timestamp: new Date().toISOString(),
    query,
    resultCount: results.length,
    userAgent: request.headers.get('User-Agent')
  };

  // Return formatted response
  return new Response(JSON.stringify({
    status: 'success',
    query,
    results,
    metadata: {
      ...searchIndex.metadata,
      resultCount: results.length,
      searchTimestamp: new Date().toISOString()
    }
  }), {
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=60'
    }
  });
}
