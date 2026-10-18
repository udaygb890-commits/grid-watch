const http = require('http');
const { app } = require('./server.js');

let server;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5098,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  server = app.listen(5098);
  console.log('[Test Suite] Running API and Auth Security Verification...');

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    console.log('1. Health check status:', health.status, health.data.status);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Test Admin login with correct role
    const adminLogin = await request('POST', '/api/auth/login', {
      username: 'admin.gridwatch',
      password: 'Admin@GridWatch2026!',
      selectedRole: 'admin',
      rememberMe: true
    });
    console.log('2. Admin login status:', adminLogin.status, adminLogin.data.success);
    if (adminLogin.status !== 200 || !adminLogin.data.token) throw new Error('Admin login failed');
    const adminToken = adminLogin.data.token;

    // 3. Test Role Mismatch (CRITICAL REQUIREMENT):
    // Admin user attempts to authenticate selecting "substation_team" portal
    const mismatchTest = await request('POST', '/api/auth/login', {
      username: 'admin.gridwatch',
      password: 'Admin@GridWatch2026!',
      selectedRole: 'substation_team'
    });
    console.log('3. Role Mismatch test status:', mismatchTest.status, mismatchTest.data.error);
    if (mismatchTest.status !== 403 || mismatchTest.data.error !== 'RoleMismatch') {
      throw new Error('Role mismatch did not return 403 RoleMismatch');
    }

    // 4. Test Substation Team - Station Operator login
    const opLogin = await request('POST', '/api/auth/login', {
      username: 'operator.sub12',
      password: 'Station@GridWatch2026!',
      selectedRole: 'substation_team'
    });
    console.log('4. Station Operator login status:', opLogin.status, opLogin.data.redirectUrl);
    if (opLogin.status !== 200 || opLogin.data.redirectUrl !== '/substation/operator') {
      throw new Error('Station Operator redirectUrl incorrect: ' + opLogin.data.redirectUrl);
    }
    const opToken = opLogin.data.token;

    // 5. Test Substation Team - Field Engineer login
    const feLogin = await request('POST', '/api/auth/login', {
      username: 'engineer.field',
      password: 'Field@GridWatch2026!',
      selectedRole: 'substation_team'
    });
    console.log('5. Field Engineer login status:', feLogin.status, feLogin.data.redirectUrl);
    if (feLogin.status !== 200 || feLogin.data.redirectUrl !== '/substation/field-engineer') {
      throw new Error('Field Engineer redirectUrl incorrect: ' + feLogin.data.redirectUrl);
    }
    const feToken = feLogin.data.token;

    // 6. Test Field Engineer accessing Admin route (should be 403 Forbidden)
    const forbiddenAdmin = await request('GET', '/api/admin/users', null, {
      'Authorization': `Bearer ${feToken}`
    });
    console.log('6. Field Engineer accessing admin route:', forbiddenAdmin.status, forbiddenAdmin.data.error);
    if (forbiddenAdmin.status !== 403) throw new Error('Expected 403 Forbidden for non-admin');

    // 7. Test Admin accessing Admin route (should be 200 OK)
    const allowedAdmin = await request('GET', '/api/admin/users', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('7. Admin accessing admin route:', allowedAdmin.status, 'Total users:', allowedAdmin.data.users?.length);
    if (allowedAdmin.status !== 200) throw new Error('Expected 200 OK for admin');

    // 8. Test Locked Account (locked.user)
    const lockedLogin = await request('POST', '/api/auth/login', {
      username: 'locked.user',
      password: 'Locked@Demo2026!',
      selectedRole: 'control_room'
    });
    console.log('8. Locked user login status:', lockedLogin.status, lockedLogin.data.error);
    if (lockedLogin.status !== 423) throw new Error('Expected 423 AccountLocked');

    // 9. Test Invalid Credentials
    const badLogin = await request('POST', '/api/auth/login', {
      username: 'cr.operator',
      password: 'WrongPassword123!',
      selectedRole: 'control_room'
    });
    console.log('9. Bad credentials login status:', badLogin.status, badLogin.data.message);
    if (badLogin.status !== 401) throw new Error('Expected 401 InvalidCredentials');

    // 10. Test Forgot Password
    const forgotPw = await request('POST', '/api/auth/forgot-password', {
      identifier: 'operator.sub12'
    });
    console.log('10. Forgot password status:', forgotPw.status, 'Reset Token:', forgotPw.data.resetToken);
    if (forgotPw.status !== 200 || !forgotPw.data.resetToken) throw new Error('Forgot password failed');

    // 11. Test Reset Password
    const resetPw = await request('POST', '/api/auth/reset-password', {
      resetToken: forgotPw.data.resetToken,
      newPassword: 'Station@GridWatch2026!'
    });
    console.log('11. Reset password status:', resetPw.status, resetPw.data.message);
    if (resetPw.status !== 200) throw new Error('Reset password failed');

    // 12. Test Logout
    const logoutRes = await request('POST', '/api/auth/logout', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('12. Logout status:', logoutRes.status, logoutRes.data.message);
    if (logoutRes.status !== 200) throw new Error('Logout failed');

    // 13. Verify revoked session cannot access protected route
    const afterLogout = await request('GET', '/api/admin/users', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('13. Access after logout status:', afterLogout.status, afterLogout.data.error);
    if (afterLogout.status !== 401) throw new Error('Expected 401 after session revocation');

    console.log('\n====================================================');
    console.log('🎉 ALL 13 BACKEND & AUTH SECURITY TESTS PASSED 100%!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
