import http from "http";

const CONFIG = {
  mockServerPort: 30090,
  mockServerHost: 'localhost'
};

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            body: JSON.parse(body)
          };
          resolve(result);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testStateAPI() {
  console.log('Testing Provider State Management API...\n');

  try {
    // Test 1: Get orders without any state set (should use default)
    console.log('1. Testing default behavior (no state set):');
    const defaultResponse = await makeRequest({
      hostname: CONFIG.mockServerHost,
      port: CONFIG.mockServerPort,
      path: '/api/v1/orders',
      method: 'GET'
    });
    console.log(`Status: ${defaultResponse.statusCode}`);
    console.log(`Response: ${JSON.stringify(defaultResponse.body, null, 2)}\n`);

    // Test 2: Set provider state to "orders exist"
    console.log('2. Setting provider state to "orders exist":');
    const setStateResponse = await makeRequest({
      hostname: CONFIG.mockServerHost,
      port: CONFIG.mockServerPort,
      path: '/api/mock-server/state',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { state: "orders exist" });
    console.log(`Status: ${setStateResponse.statusCode}`);
    console.log(`Response: ${JSON.stringify(setStateResponse.body, null, 2)}\n`);

    // Test 3: Get orders with "orders exist" state
    console.log('3. Testing with "orders exist" state:');
    const ordersExistResponse = await makeRequest({
      hostname: CONFIG.mockServerHost,
      port: CONFIG.mockServerPort,
      path: '/api/v1/orders',
      method: 'GET'
    });
    console.log(`Status: ${ordersExistResponse.statusCode}`);
    console.log(`Response: ${JSON.stringify(ordersExistResponse.body, null, 2)}\n`);

    // Test 4: Set provider state to "server is experiencing issues"
    console.log('4. Setting provider state to "server is experiencing issues":');
    const setErrorStateResponse = await makeRequest({
      hostname: CONFIG.mockServerHost,
      port: CONFIG.mockServerPort,
      path: '/api/mock-server/state',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { state: "server is experiencing issues" });
    console.log(`Status: ${setErrorStateResponse.statusCode}`);
    console.log(`Response: ${JSON.stringify(setErrorStateResponse.body, null, 2)}\n`);

    // Test 5: Get orders with error state
    console.log('5. Testing with "server is experiencing issues" state:');
    const errorStateResponse = await makeRequest({
      hostname: CONFIG.mockServerHost,
      port: CONFIG.mockServerPort,
      path: '/api/v1/orders',
      method: 'GET'
    });
    console.log(`Status: ${errorStateResponse.statusCode}`);
    console.log(`Response: ${JSON.stringify(errorStateResponse.body, null, 2)}\n`);

    // Test 6: Reset state
    console.log('6. Resetting provider states:');
    const resetResponse = await makeRequest({
      hostname: CONFIG.mockServerHost,
      port: CONFIG.mockServerPort,
      path: '/api/mock-server/reset',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(`Status: ${resetResponse.statusCode}`);
    console.log(`Response: ${JSON.stringify(resetResponse.body, null, 2)}\n`);

    // Test 7: Get orders after reset
    console.log('7. Testing after reset:');
    const afterResetResponse = await makeRequest({
      hostname: CONFIG.mockServerHost,
      port: CONFIG.mockServerPort,
      path: '/api/v1/orders',
      method: 'GET'
    });
    console.log(`Status: ${afterResetResponse.statusCode}`);
    console.log(`Response: ${JSON.stringify(afterResetResponse.body, null, 2)}\n`);

    // Test 8: Try invalid state
    console.log('8. Testing invalid provider state:');
    const invalidStateResponse = await makeRequest({
      hostname: CONFIG.mockServerHost,
      port: CONFIG.mockServerPort,
      path: '/api/mock-server/state',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { state: "nonexistent state" });
    console.log(`Status: ${invalidStateResponse.statusCode}`);
    console.log(`Response: ${JSON.stringify(invalidStateResponse.body, null, 2)}\n`);

    console.log('All tests completed!');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testStateAPI(); 