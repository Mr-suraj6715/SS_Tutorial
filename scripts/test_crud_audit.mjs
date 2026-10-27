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

async function runFullCrudAudit() {
  console.log('=== ADMIN CRUD & SECURITY DEEP AUDIT ===\n');

  // Authenticate
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@sstutorial.com', password: 'Admin@123456' });

  const token = loginRes.body?.token;
  if (!token) throw new Error('Could not login as admin');
  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${details ? '- ' + JSON.stringify(details) : ''}`);
      failed++;
    }
  }

  // 1. Users CRUD & Last Admin Protection
  console.log('\n--- MODULE 1: Users & Roles ---');
  let newUserId = null;
  const createUserRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/users',
    method: 'POST',
    headers
  }, {
    full_name: 'Test Teacher Audit',
    email: 'test_teacher_' + Date.now() + '@sstutorial.com',
    password: 'Password@123',
    phone: '9876543210',
    role: 'teacher'
  });
  newUserId = createUserRes.body?.user?.id || createUserRes.body?.id;
  assert(createUserRes.status === 201 && !!newUserId, 'Create new user (Teacher)', createUserRes.body);

  if (newUserId) {
    // Update user via PUT
    const updateUserRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/users/${newUserId}`,
      method: 'PUT',
      headers
    }, {
      full_name: 'Test Teacher Updated',
      phone: '9876543211',
      role: 'teacher'
    });
    assert(updateUserRes.status === 200, 'Update user profile (PUT)', updateUserRes.body);

    // Delete user
    const deleteUserRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/users/${newUserId}`,
      method: 'DELETE',
      headers
    });
    assert(deleteUserRes.status === 200, 'Delete user', deleteUserRes.body);
  }

  // Attempt to demote/delete last admin (u-admin-001)
  const demoteAdminRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/users/u-admin-001',
    method: 'PUT',
    headers
  }, {
    full_name: 'Institute Administrator',
    role: 'student'
  });
  assert(demoteAdminRes.status === 400 || demoteAdminRes.status === 403, 'Protect last admin from demotion', demoteAdminRes.body);

  const deleteAdminRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/users/u-admin-001',
    method: 'DELETE',
    headers
  });
  assert(deleteAdminRes.status === 400 || deleteAdminRes.status === 403, 'Protect last admin from deletion', deleteAdminRes.body);

  // 2. Courses CRUD
  console.log('\n--- MODULE 2: Courses Manager ---');
  let newCourseId = null;
  const createCourseRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/courses',
    method: 'POST',
    headers
  }, {
    title: 'Audit Test Course',
    slug: 'audit-test-course-' + Date.now(),
    board: 'CBSE',
    target_class: 'Class 10',
    subjects: 'Science, Math',
    description: 'A test course for automated audit',
    syllabus: 'Chapter 1 to 10',
    duration: '1 Year',
    fee: '15000',
    batch_info: 'Morning 8am',
    faculty_name: 'Dr. Test',
    category: 'Class 10',
    image_url: '/uploads/sample.jpg',
    display_order: 99,
    is_active: 1
  });
  newCourseId = createCourseRes.body?.course?.id || createCourseRes.body?.id;
  assert(createCourseRes.status === 201 && !!newCourseId, 'Create course', createCourseRes.body);

  if (newCourseId) {
    const updateCourseRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/courses/${newCourseId}`,
      method: 'PUT',
      headers
    }, {
      title: 'Audit Test Course Renamed',
      fee: '18000'
    });
    assert(updateCourseRes.status === 200, 'Update course (PUT)', updateCourseRes.body);

    const deleteCourseRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/courses/${newCourseId}`,
      method: 'DELETE',
      headers
    });
    assert(deleteCourseRes.status === 200, 'Delete course', deleteCourseRes.body);
  }

  // 3. Subjects CRUD
  console.log('\n--- MODULE 3: Subjects Manager ---');
  let newSubjId = null;
  const createSubjRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/subjects',
    method: 'POST',
    headers
  }, {
    name: 'Advanced Mathematics Audit',
    code: 'MATH-AUDIT-' + Date.now(),
    board: 'SSC',
    target_class: 'Class 10',
    description: 'High level math',
    display_order: 1,
    is_active: 1
  });
  newSubjId = createSubjRes.body?.subject?.id || createSubjRes.body?.id;
  assert(createSubjRes.status === 201 && !!newSubjId, 'Create subject', createSubjRes.body);

  if (newSubjId) {
    const updateSubjRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/subjects/${newSubjId}`,
      method: 'PUT',
      headers
    }, {
      name: 'Advanced Mathematics Updated',
      description: 'Updated description'
    });
    assert(updateSubjRes.status === 200, 'Update subject (PUT)', updateSubjRes.body);

    const deleteSubjRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/subjects/${newSubjId}`,
      method: 'DELETE',
      headers
    });
    assert(deleteSubjRes.status === 200, 'Delete subject', deleteSubjRes.body);
  }

  // 4. Batches CRUD
  console.log('\n--- MODULE 4: Batches Manager ---');
  const courses = await request({ hostname: 'localhost', port: 5000, path: '/api/courses?all=true', method: 'GET', headers });
  const coursesList = courses.body?.courses || courses.body || [];
  const sampleCourseId = coursesList[0]?.id;

  let newBatchId = null;
  const createBatchRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/batches',
    method: 'POST',
    headers
  }, {
    name: 'Audit Batch 2026',
    course_id: sampleCourseId,
    schedule: 'Mon, Wed, Fri 4:00 PM - 6:00 PM',
    start_date: '2026-06-01',
    end_date: '2027-03-31',
    capacity: 35,
    is_active: 1
  });
  newBatchId = createBatchRes.body?.batch?.id || createBatchRes.body?.id;
  assert(createBatchRes.status === 201 && !!newBatchId, 'Create batch', createBatchRes.body);

  if (newBatchId) {
    const updateBatchRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/batches/${newBatchId}`,
      method: 'PUT',
      headers
    }, {
      name: 'Audit Batch 2026 Updated',
      capacity: 40
    });
    assert(updateBatchRes.status === 200, 'Update batch (PUT)', updateBatchRes.body);

    const deleteBatchRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/batches/${newBatchId}`,
      method: 'DELETE',
      headers
    });
    assert(deleteBatchRes.status === 200, 'Delete batch', deleteBatchRes.body);
  }

  // 5. Admissions Workflow
  console.log('\n--- MODULE 5: Admissions ---');
  let newAdmId = null;
  const createAdmRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admissions',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    student_name: 'Test Applicant ' + Date.now(),
    parent_name: 'Parent Applicant',
    phone: '987654' + Math.floor(1000 + Math.random() * 9000),
    email: 'testapplicant_' + Date.now() + '@example.com',
    address: '123 Test Street, Mumbai',
    course_id: sampleCourseId
  });
  newAdmId = createAdmRes.body?.admission?.id || createAdmRes.body?.id;
  assert(createAdmRes.status === 201 && !!newAdmId, 'Submit admission application', createAdmRes.body);

  if (newAdmId) {
    // Approve admission
    const approveRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/admissions/${newAdmId}/status`,
      method: 'PUT',
      headers
    }, { status: 'approved' });
    assert(approveRes.status === 200, 'Approve admission application', approveRes.body);

    // Reject admission with reason
    const rejectRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/admissions/${newAdmId}/status`,
      method: 'PUT',
      headers
    }, { status: 'rejected', rejection_reason: 'Incomplete documentation' });
    assert(rejectRes.status === 200, 'Reject admission with reason', rejectRes.body);

    // Delete admission
    const deleteAdmRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/admissions/${newAdmId}`,
      method: 'DELETE',
      headers
    });
    assert(deleteAdmRes.status === 200, 'Delete admission record', deleteAdmRes.body);
  }

  // 6. Fees CRUD
  console.log('\n--- MODULE 6: Fees & Dues ---');
  const usersRes = await request({ hostname: 'localhost', port: 5000, path: '/api/users', method: 'GET', headers });
  const usersList = usersRes.body?.users || usersRes.body || [];
  const student = usersList.find(u => u.role === 'student');
  const batchesRes = await request({ hostname: 'localhost', port: 5000, path: '/api/batches?all=true', method: 'GET', headers });
  const batchesList = batchesRes.body?.batches || batchesRes.body || [];
  const testBatchId = batchesList[0]?.id;

  if (student && testBatchId) {
    let feeId = null;
    const createFeeRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/fees',
      method: 'POST',
      headers
    }, {
      student_id: student.id,
      batch_id: testBatchId,
      amount: 12000,
      paid_amount: 5000,
      due_date: '2026-12-31',
      status: 'partial',
      method: 'UPI',
      remarks: 'First installment paid'
    });
    feeId = createFeeRes.body?.fee?.id || createFeeRes.body?.id;
    assert(createFeeRes.status === 201 && !!feeId, 'Create fee entry', createFeeRes.body);

    if (feeId) {
      const updateFeeRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/fees/${feeId}`,
        method: 'PUT',
        headers
      }, {
        paid_amount: 12000,
        status: 'paid',
        payment_date: '2026-10-25'
      });
      assert(updateFeeRes.status === 200, 'Update fee payment status', updateFeeRes.body);

      const deleteFeeRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/fees/${feeId}`,
        method: 'DELETE',
        headers
      });
      assert(deleteFeeRes.status === 200, 'Delete fee entry', deleteFeeRes.body);
    }
  } else {
    console.log('⚠️ Student or batch not available for fees test, skipped');
  }

  // 7. Exams & Marks CRUD
  console.log('\n--- MODULE 7: Exams & Marks ---');
  if (testBatchId) {
    let examId = null;
    const createExamRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/exams',
      method: 'POST',
      headers
    }, {
      batch_id: testBatchId,
      title: 'Term 1 Science Audit Exam',
      date: '2026-11-15',
      total_marks: 100,
      passing_marks: 40
    });
    examId = createExamRes.body?.exam?.id || createExamRes.body?.id;
    assert(createExamRes.status === 201 && !!examId, 'Create exam', createExamRes.body);

    if (examId && student) {
      // Record marks
      const marksRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/exams/${examId}/results`,
        method: 'POST',
        headers
      }, {
        student_id: student.id,
        marks_obtained: 85,
        grade: 'A',
        remarks: 'Excellent understanding'
      });
      assert(marksRes.status === 200 || marksRes.status === 201, 'Record student exam marks', marksRes.body);

      // Delete exam
      const deleteExamRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/exams/${examId}`,
        method: 'DELETE',
        headers
      });
      assert(deleteExamRes.status === 200, 'Delete exam', deleteExamRes.body);
    }
  }

  // 8. Content: Blogs, Testimonials, Achievements, Facilities, Faculty, Gallery, Videos
  console.log('\n--- MODULE 8: Content Management Modules ---');
  
  // Blog
  const blogRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/content/blogs',
    method: 'POST',
    headers
  }, {
    title: 'Audit Blog Post',
    slug: 'audit-blog-' + Date.now(),
    excerpt: 'Audit test excerpt',
    content: 'Full content of the test post',
    author: 'Admin',
    is_published: 1
  });
  const blogId = blogRes.body?.blog?.id || blogRes.body?.id;
  assert(blogRes.status === 201 && !!blogId, 'Create blog post', blogRes.body);
  if (blogId) {
    const delBlog = await request({ hostname: 'localhost', port: 5000, path: `/api/content/blogs/${blogId}`, method: 'DELETE', headers });
    assert(delBlog.status === 200, 'Delete blog post', delBlog.body);
  }

  // Testimonial
  const testmRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/content/testimonials',
    method: 'POST',
    headers
  }, {
    student_name: 'Rahul Sharma Audit',
    course: 'Class 10 SSC',
    text: 'Great coaching experience!',
    rating: 5,
    is_published: 1
  });
  const testmId = testmRes.body?.testimonial?.id || testmRes.body?.id;
  assert(testmRes.status === 201 && !!testmId, 'Create testimonial', testmRes.body);
  if (testmId) {
    const delTestm = await request({ hostname: 'localhost', port: 5000, path: `/api/content/testimonials/${testmId}`, method: 'DELETE', headers });
    assert(delTestm.status === 200, 'Delete testimonial', delTestm.body);
  }

  // Achievement
  const achRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/content/achievements',
    method: 'POST',
    headers
  }, {
    title: 'Top State Rank Audit',
    description: 'Scored 99.4% in SSC board',
    date: '2026-06-15',
    category: 'SSC'
  });
  const achId = achRes.body?.achievement?.id || achRes.body?.id;
  assert(achRes.status === 201 && !!achId, 'Create achievement', achRes.body);
  if (achId) {
    const delAch = await request({ hostname: 'localhost', port: 5000, path: `/api/content/achievements/${achId}`, method: 'DELETE', headers });
    assert(delAch.status === 200, 'Delete achievement', delAch.body);
  }

  // Facility
  const facRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/content/facilities',
    method: 'POST',
    headers
  }, {
    title: 'Smart Tech Classroom Audit',
    description: 'High-res interactive smart boards',
    icon: 'Monitor',
    display_order: 1
  });
  const facId = facRes.body?.facility?.id || facRes.body?.id;
  assert(facRes.status === 201 && !!facId, 'Create facility', facRes.body);
  if (facId) {
    const delFac = await request({ hostname: 'localhost', port: 5000, path: `/api/content/facilities/${facId}`, method: 'DELETE', headers });
    assert(delFac.status === 200, 'Delete facility', delFac.body);
  }

  // Faculty
  const facultyRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/content/faculty',
    method: 'POST',
    headers
  }, {
    name: 'Prof. Rajesh K. Audit',
    designation: 'Senior Physics Expert',
    bio: '15+ years experience in SSC/CBSE Board prep',
    subjects: 'Physics, Math',
    display_order: 1
  });
  const facultyId = facultyRes.body?.faculty?.id || facultyRes.body?.id;
  assert(facultyRes.status === 201 && !!facultyId, 'Create faculty member', facultyRes.body);
  if (facultyId) {
    const delFaculty = await request({ hostname: 'localhost', port: 5000, path: `/api/content/faculty/${facultyId}`, method: 'DELETE', headers });
    assert(delFaculty.status === 200, 'Delete faculty member', delFaculty.body);
  }

  // Gallery
  const galRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/gallery',
    method: 'POST',
    headers
  }, {
    title: 'Annual Function 2026 Audit',
    image_url: '/uploads/sample-gallery.jpg',
    placement: 'gallery',
    is_published: 1
  });
  const galId = galRes.body?.item?.id || galRes.body?.gallery?.id || galRes.body?.id;
  assert(galRes.status === 201 && !!galId, 'Create gallery image item', galRes.body);
  if (galId) {
    const delGal = await request({ hostname: 'localhost', port: 5000, path: `/api/gallery/${galId}`, method: 'DELETE', headers });
    assert(delGal.status === 200, 'Delete gallery item', delGal.body);
  }

  // Video
  const vidRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/content/videos',
    method: 'POST',
    headers
  }, {
    title: 'Audit Demo Class Video',
    url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    platform: 'youtube',
    embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    display_order: 1,
    is_active: 1
  });
  const vidId = vidRes.body?.video?.id || vidRes.body?.id;
  assert(vidRes.status === 201 && !!vidId, 'Create video item', vidRes.body);
  if (vidId) {
    const delVid = await request({ hostname: 'localhost', port: 5000, path: `/api/content/videos/${vidId}`, method: 'DELETE', headers });
    assert(delVid.status === 200, 'Delete video item', delVid.body);
  }

  // 9. Messages / Inquiries
  console.log('\n--- MODULE 9: Messages / Contact Inquiries ---');
  const msgPost = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/contact',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Parent Inquirer Audit',
    email: 'parent_' + Date.now() + '@example.com',
    phone: '9988776655',
    subject: 'Class 10 Batches Information',
    message: 'Hello, please provide details for SSC batch.'
  });
  const msgId = msgPost.body?.id || msgPost.body?.message?.id;
  assert(msgPost.status === 201 && !!msgId, 'Submit contact inquiry (Public)', msgPost.body);
  if (msgId) {
    const markRead = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/contact/${msgId}/read`,
      method: 'PUT',
      headers
    });
    assert(markRead.status === 200, 'Mark contact message as read', markRead.body);

    const delMsg = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/contact/${msgId}`,
      method: 'DELETE',
      headers
    });
    assert(delMsg.status === 200, 'Delete message', delMsg.body);
  }

  // 10. Settings
  console.log('\n--- MODULE 10: Institute Settings ---');
  const updateSettingsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/settings',
    method: 'POST',
    headers
  }, {
    key: 'institute_name',
    value: 'SS Tutorial Coaching Institute'
  });
  assert(updateSettingsRes.status === 200, 'Update site setting', updateSettingsRes.body);

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runFullCrudAudit().catch(err => {
  console.error('Audit exception:', err);
  process.exit(1);
});
