export async function onRequest(context) {
  return new Response(JSON.stringify({
    status: "active",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    endpoints: [
      "/api/search",
      "/api/resources",
      "/api/metrics"
    ]
  }), {
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
