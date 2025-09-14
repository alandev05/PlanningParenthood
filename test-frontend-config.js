#!/usr/bin/env node

/**
 * Test script to verify the frontend configuration will work
 * This simulates the frontend API calls with the updated IP addresses
 */

// Updated backend URLs (matching what we just fixed in the frontend)
const backendUrls = [
  'http://10.31.160.125:8001', // Your computer's actual IP (updated)
  'http://localhost:8001',
  'http://127.0.0.1:8001',
  'http://192.168.1.100:8001',
  'http://192.168.0.100:8001'
];

// Sample quiz data (matching what the frontend sends)
const testParams = new URLSearchParams({
  budget_per_week_usd: '50',
  transport: 'Car',
  hours_per_week_with_kid: '5',
  spouse: 'true', // Note: now properly formatted as string
  parenting_style: 'Balanced',
  number_of_kids: '1',
  child_age: '6',
  area_type: 'Suburb'
});

// Add multiple values (as the frontend does)
testParams.append('support_available', 'Spouse/partner');
testParams.append('support_available', 'Extended family');
testParams.append('priorities_ranked', 'Social');
testParams.append('priorities_ranked', 'Physical');
testParams.append('priorities_ranked', 'Emotional');
testParams.append('priorities_ranked', 'Cognitive');

async function testFrontendConfig() {
  console.log('🧪 Testing Frontend Configuration...\n');
  console.log('📋 Test parameters:', testParams.toString());
  console.log('');
  
  let successfulUrl = null;
  let lastError = null;
  
  // Simulate the frontend's backend URL testing logic
  for (let urlIndex = 0; urlIndex < backendUrls.length; urlIndex++) {
    const backendUrl = backendUrls[urlIndex];
    const maxRetries = 2;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const attemptLog = attempt > 0 ? ` (attempt ${attempt + 1}/${maxRetries + 1})` : '';
        console.log(`🌐 Trying backend URL: ${backendUrl}${attemptLog}`);
        
        // Create AbortController for timeout (matching frontend logic)
        const controller = new AbortController();
        const timeout = 5000 + (attempt * 2000); // Increase timeout with each retry
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(`${backendUrl}/api/recommend?${testParams.toString()}`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ Successfully connected to: ${backendUrl}${attemptLog}`);
          
          const data = await response.json();
          console.log(`📊 Received ${data.recommendations?.length || 0} recommendations`);
          
          if (data.recommendations && data.recommendations.length > 0) {
            console.log(`📋 Sample recommendation:`, {
              title: data.recommendations[0].title,
              category: data.recommendations[0].category,
              match_score: data.recommendations[0].match_score,
              ai_explanation: data.recommendations[0].ai_explanation?.substring(0, 100) + '...'
            });
          }
          
          successfulUrl = backendUrl;
          break; // Success, exit both loops
        } else {
          console.log(`❌ Backend responded with status: ${response.status} ${response.statusText}`);
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          
          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            break;
          }
        }
      } catch (error) {
        const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
        console.log(`❌ Failed to connect to ${backendUrl}${attemptLog}: ${errorMsg}`);
        lastError = error;
        
        // Exponential backoff delay before retry
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If we got a successful response, break out of URL loop
    if (successfulUrl) {
      break;
    }
    
    console.log(''); // Empty line between URL attempts
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (successfulUrl) {
    console.log(`🎉 SUCCESS! Frontend will connect to: ${successfulUrl}`);
    console.log(`\n✅ Your submit button flow should now work correctly!`);
    console.log(`\n📱 Next steps:`);
    console.log(`   1. Restart your frontend app to pick up the IP address changes`);
    console.log(`   2. Complete the intake quiz and press Submit`);
    console.log(`   3. You should see recommendations on the RoadMap screen`);
  } else {
    console.log(`❌ FAILED! No backend URLs responded successfully`);
    console.log(`\n🔧 Troubleshooting:`);
    console.log(`   - Make sure backend is running: cd backend && python server.py`);
    console.log(`   - Check firewall settings`);
    console.log(`   - Verify IP address is correct: ${backendUrls[0]}`);
    
    if (lastError) {
      console.log(`   - Last error: ${lastError.message}`);
    }
  }
}

// Run the test
testFrontendConfig().catch(console.error);