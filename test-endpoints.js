import http from 'http';

const BASE_URL = 'http://localhost:3000';
let authCookie = null;

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
        ...headers,
      },
    };

    // Add cookie if available
    if (authCookie) {
      options.headers['Cookie'] = authCookie;
    }

    const req = http.request(options, (res) => {
      let data = '';

      // Capture Set-Cookie header
      const cookies = res.headers['set-cookie'];
      if (cookies) {
        authCookie = cookies.map(c => c.split(';')[0]).join('; ');
        console.log('Cookie recu:', authCookie);
      }

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

// Test 2: POST /api/auth/sign-up/email
async function testPostSignUp() {
  console.log('\n--- Test 2: POST /api/auth/sign-up/email ---');
  try {
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'motdepasse123';
    const testName = 'Jean Dupont';

    const response = await makeRequest('POST', '/api/auth/sign-up/email', {
      name: testName,
      email: testEmail,
      password: testPassword,
    });

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 || response.status === 201) {
      console.log('Test 2 PASSED: User created successfully');
      return { success: true, email: testEmail, password: testPassword, name: testName };
    } else {
      console.log('Test 2 FAILED');
      return { success: false };
    }
  } catch (error) {
    console.log('Test 2 FAILED:', error.message);
    return { success: false };
  }
}

// Test 3: POST /api/auth/sign-in/email
async function testPostSignIn(email, password) {
  console.log('\n--- Test 3: POST /api/auth/sign-in/email ---');
  try {
    const response = await makeRequest('POST', '/api/auth/sign-in/email', {
      email: email,
      password: password,
    });

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('Test 3 PASSED: User signed in successfully');
      return response.data;
    } else {
      console.log('Test 3 FAILED');
      return null;
    }
  } catch (error) {
    console.log('Test 3 FAILED:', error.message);
    return null;
  }
}

// Test 4: GET /api/auth/get-session
async function testGetSession() {
  console.log('\n--- Test 4: GET /api/auth/get-session ---');
  try {
    const response = await makeRequest('GET', '/api/auth/get-session');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.user) {
      console.log('Test 4 PASSED: Session is valid');
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
  const savedCookie = authCookie;
  authCookie = null; // Remove cookie
  
  try {
    const response = await makeRequest('GET', '/api/users/me');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 401) {
      console.log('Test 6 PASSED: Protected route returns 401 without auth');
      authCookie = savedCookie; // Restore cookie
      return true;
    } else {
      console.log('Test 6 FAILED: Should return 401');
      authCookie = savedCookie;
      return false;
    }
  } catch (error) {
    console.log('Test 6 FAILED:', error.message);
    authCookie = savedCookie;
    return false;
  }
}

// Test 7: POST /api/auth/forget-password
async function testPostForgetPassword(email) {
  console.log('\n--- Test 7: POST /api/auth/forget-password ---');
  try {
    const response = await makeRequest('POST', '/api/auth/forget-password', {
      email: email,
      redirectTo: 'http://localhost:5173/reset-password',
    });

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('Test 7 PASSED: Password reset email sent');
      return true;
    } else {
      console.log('Test 7 FAILED');
      return false;
    }
  } catch (error) {
    console.log('Test 7 FAILED:', error.message);
    return false;
  }
}

// Test 8: POST /api/auth/sign-out
async function testPostSignOut() {
  console.log('\n--- Test 8: POST /api/auth/sign-out ---');
  try {
    const response = await makeRequest('POST', '/api/auth/sign-out');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('Test 8 PASSED: User signed out');
      authCookie = null; // Clear cookie
      return true;
    } else {
      console.log('Test 8 FAILED');
      return false;
    }
  } catch (error) {
    console.log('Test 8 FAILED:', error.message);
    return false;
  }
}

// Test 9: Verify session is cleared after sign out
async function testSessionAfterSignOut() {
  console.log('\n--- Test 9: GET /api/auth/get-session (after sign out) ---');
  try {
    const response = await makeRequest('GET', '/api/auth/get-session');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && !response.data.user) {
      console.log('Test 9 PASSED: Session cleared after sign out');
      return true;
    } else {
      console.log('Test 9 FAILED: Session should be null');
      return false;
    }
  } catch (error) {
    console.log('Test 9 FAILED:', error.message);
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
    test7: false,
    test8: false,
    test9: false,
  };

  let userEmail = null;
  let userPassword = null;

  // Test 1: GET /health
  results.test1 = await testGetHealth();

  // Test 2: POST /api/auth/sign-up/email
  const signUpResult = await testPostSignUp();
  results.test2 = signUpResult.success;
  if (signUpResult.success) {
    userEmail = signUpResult.email;
    userPassword = signUpResult.password;
  }

  // Test 3: POST /api/auth/sign-in/email
  if (userEmail && userPassword) {
    const signInData = await testPostSignIn(userEmail, userPassword);
    results.test3 = signInData !== null;
  }

  // Test 4: GET /api/auth/get-session
  results.test4 = await testGetSession();

  // Test 5: GET /api/users/me (with auth)
  results.test5 = await testGetMeProtected();

  // Test 6: GET /api/users/me (without auth)
  results.test6 = await testGetMeUnauthenticated();

  // Test 7: POST /api/auth/forget-password
  if (userEmail) {
    results.test7 = await testPostForgetPassword(userEmail);
  }

  // Test 8: POST /api/auth/sign-out
  results.test8 = await testPostSignOut();

  // Test 9: Verify session is cleared
  results.test9 = await testSessionAfterSignOut();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary:');
  console.log('='.repeat(60));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.values(results).length;
  
  console.log('Test 1 - GET /health:', results.test1 ? 'PASS' : 'FAIL');
  console.log('Test 2 - POST /api/auth/sign-up/email:', results.test2 ? 'PASS' : 'FAIL');
  console.log('Test 3 - POST /api/auth/sign-in/email:', results.test3 ? 'PASS' : 'FAIL');
  console.log('Test 4 - GET /api/auth/get-session:', results.test4 ? 'PASS' : 'FAIL');
  console.log('Test 5 - GET /api/users/me (auth):', results.test5 ? 'PASS' : 'FAIL');
  console.log('Test 6 - GET /api/users/me (no auth):', results.test6 ? 'PASS' : 'FAIL');
  console.log('Test 7 - POST /api/auth/forget-password:', results.test7 ? 'PASS' : 'FAIL');
  console.log('Test 8 - POST /api/auth/sign-out:', results.test8 ? 'PASS' : 'FAIL');
  console.log('Test 9 - Session cleared after sign out:', results.test9 ? 'PASS' : 'FAIL');
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