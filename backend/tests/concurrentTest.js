require('dotenv').config();
const http = require('http');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const SHOW_ID = 1;
const SEATS_TO_BOOK = ['1', '2'];
const NUM_CONCURRENT_REQUESTS = 10;

function makeBookingRequest(userId) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      seat_nos: SEATS_TO_BOOK,
      user_id: userId,
      immediate_confirm: true
    });
    
    const url = new URL(`/shows/${SHOW_ID}/book`, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            userId,
            statusCode: res.statusCode,
            success: res.statusCode === 201,
            response
          });
        } catch (e) {
          resolve({
            userId,
            statusCode: res.statusCode,
            success: false,
            response: { error: data }
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject({ userId, error: error.message });
    });
    
    req.write(postData);
    req.end();
  });
}

async function runConcurrentTest() {
  console.log('\n========================================');
  console.log('CONCURRENT BOOKING TEST');
  console.log('========================================');
  console.log(`Testing ${NUM_CONCURRENT_REQUESTS} concurrent requests to book seats ${SEATS_TO_BOOK.join(', ')} for show ${SHOW_ID}\n`);
  
  const startTime = Date.now();
  
  // Create array of promises for concurrent requests
  const requests = [];
  for (let i = 0; i < NUM_CONCURRENT_REQUESTS; i++) {
    requests.push(makeBookingRequest(`user_${i + 1}`));
  }
  
  try {
    // Execute all requests concurrently
    const results = await Promise.all(requests);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Analyze results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log('RESULTS:');
    console.log('--------');
    console.log(`Total requests: ${results.length}`);
    console.log(`Successful bookings: ${successful.length}`);
    console.log(`Failed bookings: ${failed.length}`);
    console.log(`Duration: ${duration}ms\n`);
    
    if (successful.length > 0) {
      console.log('SUCCESSFUL BOOKINGS:');
      successful.forEach(r => {
        console.log(`  ✓ User: ${r.userId}, Booking ID: ${r.response.booking?.id}`);
      });
      console.log('');
    }
    
    if (failed.length > 0) {
      console.log('FAILED BOOKINGS:');
      failed.forEach(r => {
        const reason = r.response.error || r.response.message || 'Unknown error';
        console.log(`  ✗ User: ${r.userId}, Status: ${r.statusCode}, Reason: ${reason}`);
      });
      console.log('');
    }
    
    // Test validation
    console.log('TEST VALIDATION:');
    console.log('----------------');
    if (successful.length === 1) {
      console.log('✓ PASS: Exactly 1 booking succeeded (concurrency control working!)');
    } else if (successful.length === 0) {
      console.log('✗ FAIL: No bookings succeeded (seats might already be booked)');
    } else {
      console.log(`✗ FAIL: ${successful.length} bookings succeeded (OVERBOOKING DETECTED!)`);
    }
    
    if (failed.length === NUM_CONCURRENT_REQUESTS - 1) {
      console.log(`✓ PASS: ${failed.length} bookings failed as expected`);
    }
    
    console.log('========================================\n');
    
  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  }
}

// Run the test
runConcurrentTest();
