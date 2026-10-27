import http from 'http';

async function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runAudit() {
  console.log('--- 1. Testing Admin Login ---');
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@sstutorial.com', password: 'Admin@123456' });

  console.log('Login status:', loginRes.status);
  if (!loginRes.body?.token) {
    console.error('Failed to get token!', loginRes.body);
    process.exit(1);
  }
  const token = loginRes.body.token;
  console.log('Admin token received successfully! User:', loginRes.body.user);

  const authHeaders = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  const endpoints = [
    { name: 'Dashboard Stats', path: '/api/dashboard/stats', method: 'GET' },
    { name: 'Admissions List', path: '/api/admissions', method: 'GET' },
    { name: 'Users List', path: '/api/users', method: 'GET' },
    { name: 'Courses List', path: '/api/courses', method: 'GET' },
    { name: 'Subjects List', path: '/api/subjects', method: 'GET' },
    { name: 'Batches List', path: '/api/batches', method: 'GET' },
    { name: 'Fees List', path: '/api/fees', method: 'GET' },
    { name: 'Exams List', path: '/api/exams', method: 'GET' },
    { name: 'Blogs List', path: '/api/content/blogs', method: 'GET' },
    { name: 'Testimonials List', path: '/api/content/testimonials', method: 'GET' },
    { name: 'Achievements List', path: '/api/content/achievements', method: 'GET' },
    { name: 'Facilities List', path: '/api/content/facilities', method: 'GET' },
    { name: 'Faculty List', path: '/api/content/faculty', method: 'GET' },
    { name: 'Gallery List', path: '/api/gallery', method: 'GET' },
    { name: 'Videos List', path: '/api/content/videos', method: 'GET' },
    { name: 'Messages List', path: '/api/contact', method: 'GET' },
    { name: 'Settings', path: '/api/settings', method: 'GET' },
  ];

  console.log('\n--- 2. Testing Read/List Endpoints ---');
  for (const ep of endpoints) {
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: ep.path,
      method: ep.method,
      headers: authHeaders
    });
    const isOk = res.status >= 200 && res.status < 300;
    const count = Array.isArray(res.body) ? res.body.length : (res.body ? Object.keys(res.body).length : 0);
    console.log(`${isOk ? '✅' : '❌'} [${res.status}] ${ep.name} (${ep.path}) -> ${count} items`);
    if (!isOk) console.log('   Error body:', res.body || res.raw);
  }

  console.log('\n--- 3. Testing Security: Unauthenticated Access Rejection ---');
  for (const ep of [
    { name: 'Users without token', path: '/api/users' },
    { name: 'Admissions without token', path: '/api/admissions' },
    { name: 'Fees without token', path: '/api/fees' }
  ]) {
    const unauthRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: ep.path,
      method: 'GET'
    });
    console.log(`${unauthRes.status === 401 || unauthRes.status === 403 ? '✅' : '❌'} [${unauthRes.status}] ${ep.name}`);
  }
}

runAudit().catch(console.error);
