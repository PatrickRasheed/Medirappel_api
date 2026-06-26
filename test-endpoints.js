import http from 'http';

const BASE_URL = 'http://localhost:3000';
let authToken = null;

// Helper function to make HTTP requests
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        ...headers,
      },
    };

    // Add Authorization header if token exists
    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Test 1: GET /health
async function testGetHealth() {
  console.log('\n--- Test 1: GET /health ---');
  try {
    const response = await makeRequest('GET', '/health');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.status === 'ok') {
      console.log('Test 1 PASSED: Server is running');
      return true;
    } else {
      console.log('Test 1 FAILED');
      return false;
    }
  } catch (error) {
    console.log('Test 1 FAILED:', error.message);
    return false;
  }
}

// Test 2: POST /api/auth/register
async function testPostRegister() {
  console.log('\n--- Test 2: POST /api/auth/register ---');
  try {
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'password123';

    const response = await makeRequest('POST', '/api/auth/register', {
      email: testEmail,
      password: testPassword,
    });

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 201 && response.data.user) {
      console.log('Test 2 PASSED: User registered successfully');
      return { success: true, email: testEmail, password: testPassword };
    } else {
      console.log('Test 2 FAILED');
      return { success: false };
    }
  } catch (error) {
    console.log('Test 2 FAILED:', error.message);
    return { success: false };
  }
}

// Test 3: POST /api/auth/verify-otp
async function testVerifyOTP(email) {
  console.log('\n--- Test 3: POST /api/auth/verify-otp ---');
  try {
    // In a real scenario, you would get the OTP from the email
    // For testing, we'll use a dummy OTP
    const testOTP = '123456';

    const response = await makeRequest('POST', '/api/auth/verify-otp', {
      email: email,
      otp: testOTP,
    });

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.user) {
      console.log('Test 3 PASSED: OTP verified successfully');
      return true;
    } else {
      console.log('Test 3 FAILED (expected - OTP will be invalid in test)');
      return false;
    }
  } catch (error) {
    console.log('Test 3 FAILED:', error.message);
    return false;
  }
}

// Test 4: POST /api/auth/login
async function testPostLogin(email, password) {
  console.log('\n--- Test 4: POST /api/auth/login ---');
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: email,
      password: password,
    });

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.token) {
      console.log('Test 4 PASSED: User logged in successfully');
      authToken = response.data.token;
      return true;
    } else {
      console.log('Test 4 FAILED');
      return false;
    }
  } catch (error) {
    console.log('Test 4 FAILED:', error.message);
    return false;
  }
}

// Test 5: GET /api/users/me (protected route)
async function testGetMeProtected() {
  console.log('\n--- Test 5: GET /api/users/me (with auth) ---');
  try {
    const response = await makeRequest('GET', '/api/users/me');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.user) {
      console.log('Test 5 PASSED: Protected route accessible with auth');
      return true;
    } else {
      console.log('Test 5 FAILED');
      return false;
    }
  } catch (error) {
    console.log('Test 5 FAILED:', error.message);
    return false;
  }
}

// Test 6: GET /api/users/me (without auth)
async function testGetMeUnauthenticated() {
  console.log('\n--- Test 6: GET /api/users/me (without auth) ---');
  const savedToken = authToken;
  authToken = null; // Remove token
  
  try {
    const response = await makeRequest('GET', '/api/users/me');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 401) {
      console.log('Test 6 PASSED: Protected route returns 401 without auth');
      authToken = savedToken; // Restore token
      return true;
    } else {
      console.log('Test 6 FAILED: Should return 401');
      authToken = savedToken;
      return false;
    }
  } catch (error) {
    console.log('Test 6 FAILED:', error.message);
    authToken = savedToken;
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('Starting API Tests...');
  console.log('Testing against:', BASE_URL);
  console.log('Make sure the server is running on port 3000\n');
  console.log('='.repeat(60));

  const results = {
    test1: false,
    test2: false,
    test3: false,
    test4: false,
    test5: false,
    test6: false,
  };

  let userEmail = null;
  let userPassword = null;

  // Test 1: GET /health
  results.test1 = await testGetHealth();

  // Test 2: POST /api/auth/register
  const registerResult = await testPostRegister();
  results.test2 = registerResult.success;
  if (registerResult.success) {
    userEmail = registerResult.email;
    userPassword = registerResult.password;
  }

  // Test 3: POST /api/auth/verify-otp
  if (userEmail) {
    results.test3 = await testVerifyOTP(userEmail);
  }

  // Test 4: POST /api/auth/login
  if (userEmail && userPassword) {
    results.test4 = await testPostLogin(userEmail, userPassword);
  }

  // Test 5: GET /api/users/me (with auth)
  results.test5 = await testGetMeProtected();

  // Test 6: GET /api/users/me (without auth)
  results.test6 = await testGetMeUnauthenticated();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary:');
  console.log('='.repeat(60));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.values(results).length;
  
  console.log('Test 1 - GET /health:', results.test1 ? 'PASS' : 'FAIL');
  console.log('Test 2 - POST /api/auth/register:', results.test2 ? 'PASS' : 'FAIL');
  console.log('Test 3 - POST /api/auth/verify-otp:', results.test3 ? 'PASS (expected to fail - invalid OTP)' : 'FAIL');
  console.log('Test 4 - POST /api/auth/login:', results.test4 ? 'PASS' : 'FAIL');
  console.log('Test 5 - GET /api/users/me (auth):', results.test5 ? 'PASS' : 'FAIL');
  console.log('Test 6 - GET /api/users/me (no auth):', results.test6 ? 'PASS' : 'FAIL');
  console.log('='.repeat(60));
  console.log(`Total: ${passed}/${total} tests passed`);
  console.log('='.repeat(60));

  if (passed === total) {
    console.log('\nAll tests passed!');
  } else {
    console.log('\nSome tests failed. Check the output above for details.');
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Test runner failed:', error);
  process.exit(1);
});