const https = require('https');
const dns = require('dns');
const { promisify } = require('util');

const resolveCname = promisify(dns.resolveCname);

const DOMAINS = {
  root: 'ihelper.tech',
  www: 'www.ihelper.tech',
  api: 'api.ihelper.tech'
};

const EXPECTED_CNAME = 'ihelper-library.pages.dev';

const ENDPOINTS = [
  { path: '/', expectedStatus: 200 },
  { path: '/api/health', expectedStatus: 200 },
  { path: '/api/search?q=test', expectedStatus: 200 }
];

const REQUIRED_HEADERS = [
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
  'content-security-policy'
];

async function checkDns(domain) {
  try {
    const cnames = await resolveCname(domain);
    return {
      domain,
      success: cnames.includes(EXPECTED_CNAME),
      actual: cnames[0],
      expected: EXPECTED_CNAME
    };
  } catch (error) {
    return {
      domain,
      success: false,
      error: error.message
    };
  }
}

function checkEndpoint(domain, endpoint) {
  return new Promise((resolve) => {
    const url = `https://${domain}${endpoint.path}`;
    const req = https.get(url, (res) => {
      const headers = res.headers;
      const missingHeaders = REQUIRED_HEADERS.filter(
        header => !headers[header]
      );

      resolve({
        url,
        success: res.statusCode === endpoint.expectedStatus,
        statusCode: res.statusCode,
        expected: endpoint.expectedStatus,
        ssl: res.socket.authorized,
        headers: {
          present: REQUIRED_HEADERS.filter(header => headers[header]),
          missing: missingHeaders
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        success: false,
        error: error.message
      });
    });

    req.end();
  });
}

async function runVerification() {
  console.log('🔍 Starting Deployment Verification');
  console.log('==================================');

  // Check DNS
  console.log('\n📡 Checking DNS Records...');
  for (const [key, domain] of Object.entries(DOMAINS)) {
    const result = await checkDns(domain);
    console.log(`${result.success ? '✅' : '❌'} ${domain}:`);
    if (result.success) {
      console.log(`   CNAME → ${result.actual}`);
    } else {
      console.log(`   Error: ${result.error || 'Unexpected CNAME'}`);
    }
  }

  // Check Endpoints
  console.log('\n🌐 Checking Endpoints...');
  for (const [key, domain] of Object.entries(DOMAINS)) {
    console.log(`\n${domain}:`);
    for (const endpoint of ENDPOINTS) {
      const result = await checkEndpoint(domain, endpoint);
      console.log(`${result.success ? '✅' : '❌'} ${endpoint.path}`);
      if (!result.success) {
        console.log(`   Expected: ${endpoint.expectedStatus}`);
        console.log(`   Actual: ${result.statusCode || 'Connection failed'}`);
        if (result.error) console.log(`   Error: ${result.error}`);
      }
      if (result.headers) {
        if (result.headers.missing.length > 0) {
          console.log('   ⚠️ Missing Security Headers:');
          result.headers.missing.forEach(h => console.log(`   - ${h}`));
        }
      }
    }
  }

  console.log('\n==================================');
  console.log('🏁 Verification Complete');
}

runVerification().catch(console.error);
