#!/usr/bin/env node

/**
 * Simple script to test backend connectivity and /api/recommend endpoint
 * Run with: node test-backend-connectivity.js
 */

const backendUrls = [
  'http://localhost:8001',
  'http://127.0.0.1:8001',
  'http://10.189.115.63:8001',
  'http://192.168.1.100:8001',
  'http://192.168.0.100:8001'
];

// Sample quiz data for testing
const testParams = new URLSearchParams({
  budget_per_week_usd: '50',
  transport: 'Car',
  hours_per_week_with_kid: '5',
  spouse: 'true',
  parenting_style: 'Balanced',
  number_of_kids: '1',
  child_age: '6',
  area_type: 'Suburb'
});

// Add multiple values
testParams.append('support_available', 'Spouse/partner');
testParams.append('support_available', 'Extended family');
testParams.append('priorities_ranked', 'Social');
testParams.append('priorities_ranked', 'Physical');
testParams.append('priorities_ranked', 'Emotional');
testParams.append('priorities_ranked', 'Cognitive');

async function testBackendConnectivity() {
  console.log('🧪 Testing backend connectivity...\n');
  
  let successfulUrl = null;
  
  for (const url of backendUrls) {
    try {
      console.log(`🌐 Testing: ${url}`);
      
      // Test basic health endpoint first
      const healthResponse = await fetch(`${url}/api/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log(`  ✅ Health check passed:`, healthData);
        
        // Test recommend endpoint
        console.log(`  🎯 Testing recommend endpoint...`);
        const recommendResponse = await fetch(`${url}/api/recommend?${testParams.toString()}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10000)
        });
        
        if (recommendResponse.ok) {
          const recommendData = await recommendResponse.json();
          console.log(`  ✅ Recommend endpoint works! Got ${recommendData.recommendations?.length || 0} recommendations`);
          
          if (recommendData.recommendations && recommendData.recommendations.length > 0) {
            console.log(`  📋 Sample recommendation:`, {
              title: recommendData.recommendations[0].title,
              category: recommendData.recommendations[0].category,
              match_score: recommendData.recommendations[0].match_score
            });
          }
          
          successfulUrl = url;
          break;
        } else {
          console.log(`  ❌ Recommend endpoint failed: ${recommendResponse.status} ${recommendResponse.statusText}`);
        }
      } else {
        console.log(`  ❌ Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
      }
    } catch (error) {
      const errorMsg = error.name === 'TimeoutError' ? 'Request timeout' : error.message;
      console.log(`  ❌ Connection failed: ${errorMsg}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  if (successfulUrl) {
    console.log(`🎉 Backend is working at: ${successfulUrl}`);
    console.log(`\n📱 Your frontend should be able to connect successfully!`);
    console.log(`\n🔧 If frontend still fails, check:`);
    console.log(`   - Network permissions in your app`);
    console.log(`   - CORS settings on backend`);
    console.log(`   - Firewall/antivirus blocking connections`);
  } else {
    console.log(`❌ No backend URLs are responding`);
    console.log(`\n🔧 To fix this:`);
    console.log(`   1. Start the backend server: cd PlanningParenthood/backend && python server.py`);
    console.log(`   2. Check if port 8001 is available`);
    console.log(`   3. Update IP addresses in the backendUrls array if needed`);
    console.log(`   4. Check firewall settings`);
  }
}

// Run the test
testBackendConnectivity().catch(console.error);