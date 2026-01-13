// Test script for contact form submission
const http = require('http');

// Test as Advertiser (non-affiliate)
const testData = JSON.stringify({
  name: "Nayan Ray",
  email: "nayanroyjsr22@gmail.com",
  company: "JIT",
  type: "advertiser",
  messenger: "telegram",
  username: "nayanroyjsr22@gmail.com",
  message: "Hello - test submission",
  affiliate_id: "2",
  sub1: "demo_test_123",
  trackingSource: "contact_form"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/contact',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  }
};

console.log('🚀 Submitting test data to contact form...\n');
console.log('Data:', testData);
console.log('\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ Response Status:', res.statusCode);
    console.log('✅ Response Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(testData);
req.end();

console.log('Test submitted! Waiting for response...\n');

