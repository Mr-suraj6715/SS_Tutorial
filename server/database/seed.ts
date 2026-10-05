import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { get, run, query } from './connection';

export const seedDatabase = async () => {
  const existingAdmin = get('SELECT id FROM users WHERE email = ?', ['admin@sstutorial.com']);
  if (existingAdmin) {
    console.log('Database already seeded, skipping seed step.');
    return;
  }

  console.log('Seeding database with default users, courses, subjects, batches, and site settings...');

  // 1. Password Hashes
  const adminHash = await bcrypt.hash('Admin@123456', 10);
  const teacherHash = await bcrypt.hash('Teacher@123', 10);
  const studentHash = await bcrypt.hash('Student@123', 10);
  const parentHash = await bcrypt.hash('Parent@123', 10);

  // 2. Insert Users
  const adminId = 'u-admin-001';
  const teacherId = 'u-teacher-001';
  const studentId = 'u-student-001';
  const parentId = 'u-parent-001';

  // Admin
  run(`INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)`,
    [adminId, 'admin@sstutorial.com', adminHash, 'Institute Administrator', '9876543210', 'admin']);
  run(`INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)`, ['ur-1', adminId, 'admin']);
  run(`INSERT INTO profiles (id, full_name, phone, role) VALUES (?, ?, ?, ?)`,
    [adminId, 'Institute Administrator', '9876543210', 'admin']);

  // Teacher (Aniket Gupta)
  run(`INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)`,
    [teacherId, 'aniket@sstutorial.com', teacherHash, 'Aniket Gupta', '9876543211', 'teacher']);
  run(`INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)`, ['ur-2', teacherId, 'teacher']);
  run(`INSERT INTO profiles (id, full_name, phone, role, bio) VALUES (?, ?, ?, ?, ?)`,
    [teacherId, 'Aniket Gupta', '9876543211', 'teacher', 'Founder & Senior Mathematics Faculty']);
  run(`INSERT INTO teachers (id, qualification, experience_years, specialization) VALUES (?, ?, ?, ?)`,
    [teacherId, 'M.Sc. Mathematics, B.Ed.', 8, 'SSC Board Mathematics & Concept Clarity']);

  // Parent (Suresh Sharma)
  run(`INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)`,
    [parentId, 'parent@sstutorial.com', parentHash, 'Suresh Sharma', '9876543212', 'parent']);
  run(`INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)`, ['ur-3', parentId, 'parent']);
  run(`INSERT INTO profiles (id, full_name, phone, role) VALUES (?, ?, ?, ?)`,
    [parentId, 'Suresh Sharma', '9876543212', 'parent']);
  run(`INSERT INTO parents (id, occupation, alternate_phone) VALUES (?, ?, ?)`,
    [parentId, 'Business Professional', '9876543213']);

  // Student (Rahul Sharma)
  run(`INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)`,
    [studentId, 'student@sstutorial.com', studentHash, 'Rahul Sharma', '9876543214', 'student']);
  run(`INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)`, ['ur-4', studentId, 'student']);
  run(`INSERT INTO profiles (id, full_name, phone, role) VALUES (?, ?, ?, ?)`,
    [studentId, 'Rahul Sharma', '9876543214', 'student']);
  run(`INSERT INTO students (id, roll_no, class_name, board, parent_id, admission_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [studentId, 'SS-10-01', 'Class 10', 'SSC', parentId, '2026-06-15', 'active']);

  // Link Parent to Student
  run(`INSERT INTO parent_student_links (id, parent_id, student_id) VALUES (?, ?, ?)`,
    ['psl-1', parentId, studentId]);

  // 3. Classes
  const classList = [
    { id: 'c-6', name: 'Class 6', standard: '6th', board: 'SSC', order: 1 },
    { id: 'c-7', name: 'Class 7', standard: '7th', board: 'SSC', order: 2 },
    { id: 'c-8', name: 'Class 8', standard: '8th', board: 'SSC', order: 3 },
    { id: 'c-9', name: 'Class 9', standard: '9th', board: 'SSC', order: 4 },
    { id: 'c-10', name: 'Class 10', standard: '10th', board: 'SSC', order: 5 },
    { id: 'c-11', name: 'Class 11', standard: '11th', board: 'Both', order: 6 },
    { id: 'c-12', name: 'Class 12', standard: '12th', board: 'Both', order: 7 },
  ];
  for (const c of classList) {
    run(`INSERT INTO classes (id, name, standard, board, display_order) VALUES (?, ?, ?, ?, ?)`,
      [c.id, c.name, c.standard, c.board, c.order]);
  }

  // 4. Subjects
  const subjectList = [
    { id: 'sub-1', name: 'Mathematics Part I (Algebra)', code: 'MATH-10-1', board: 'SSC', target_class: 'Class 10', desc: 'Linear Equations, Quadratic Equations, Financial Planning, Statistics' },
    { id: 'sub-2', name: 'Mathematics Part II (Geometry)', code: 'MATH-10-2', board: 'SSC', target_class: 'Class 10', desc: 'Similarity, Pythagoras, Circle, Coordinate Geometry, Trigonometry' },
    { id: 'sub-3', name: 'Science & Technology', code: 'SCI-10', board: 'SSC', target_class: 'Class 10', desc: 'Physics, Chemistry, and Biology syllabus' },
    { id: 'sub-4', name: 'Mathematics Part I', code: 'MATH-9-1', board: 'SSC', target_class: 'Class 9', desc: 'Sets, Real Numbers, Polynomials & Algebra' },
    { id: 'sub-5', name: 'Mathematics Part II', code: 'MATH-9-2', board: 'SSC', target_class: 'Class 9', desc: 'Geometry, Triangles, Quadrilaterals & Circle' },
    { id: 'sub-6', name: 'Mathematics', code: 'MATH-CBSE-10', board: 'CBSE', target_class: 'Class 10', desc: 'NCERT Mathematics Curriculum' },
    { id: 'sub-7', name: 'Higher Mathematics', code: 'MATH-11', board: 'Both', target_class: 'Class 11', desc: 'Junior College Mathematics & Statistics' },
    { id: 'sub-8', name: 'Higher Mathematics', code: 'MATH-12', board: 'Both', target_class: 'Class 12', desc: 'HSC Board Exam Mathematics Preparation' },
  ];
  for (const s of subjectList) {
    run(`INSERT INTO subjects (id, name, code, board, target_class, description) VALUES (?, ?, ?, ?, ?, ?)`,
      [s.id, s.name, s.code, s.board, s.target_class, s.desc]);
  }

  // 5. Courses
  const courseList = [
    {
      id: 'course-ssc-10-math',
      title: 'Class 10 Math - SSC Board Exam Preparation',
      slug: 'class-10-math-ssc',
      board: 'SSC',
      target_class: 'Class 10',
      subjects: 'Mathematics (Part I & Part II)',
      description: 'Complete SSC Board exam preparation, textbook solutions, chapter-wise lessons, and important questions.',
      syllabus: 'Linear Equations, Quadratic Equations, Arithmetic Progression, Financial Planning, Statistics, Probability, Similarity, Pythagoras Theorem, Circle, Coordinate Geometry, Trigonometry, Mensuration',
      duration: 'Academic Year',
      fee: 'Rs. 15,000 / year',
      batch_info: 'Morning & Evening Batches Available',
      faculty_name: 'Aniket Gupta',
      order: 1
    },
    {
      id: 'course-ssc-9-math',
      title: 'Class 9 Math - Concept Building & Foundation',
      slug: 'class-9-math-ssc',
      board: 'SSC',
      target_class: 'Class 9',
      subjects: 'Mathematics (Part I & Part II)',
      description: 'Basics made easy, fun tricks, and foundational concepts for SSC Board students.',
      syllabus: 'Sets, Real Numbers, Polynomials, Ratio & Proportion, Linear Equations in Two Variables, Financial Planning, Statistics, Basic Concepts in Geometry, Parallel Lines, Triangles, Quadrilaterals, Circle',
      duration: 'Academic Year',
      fee: 'Rs. 12,000 / year',
      batch_info: 'Regular Batches',
      faculty_name: 'Aniket Gupta',
      order: 2
    },
    {
      id: 'course-ssc-8-math',
      title: 'Class 8 Math - Fundamentals & Clarity',
      slug: 'class-8-math-ssc',
      board: 'SSC',
      target_class: 'Class 8',
      subjects: 'Mathematics',
      description: 'Simplifying complex topics to help students master math with clarity and confidence.',
      syllabus: 'Rational & Irrational Numbers, Parallel Lines & Transversals, Indices & Cube Root, Altitudes & Medians, Expansion Formulae, Factorisation, Equations in One Variable, Quadrilaterals, Area, Circle',
      duration: 'Academic Year',
      fee: 'Rs. 10,000 / year',
      batch_info: 'Regular Batches',
      faculty_name: 'Aniket Gupta',
      order: 3
    },
    {
      id: 'course-cbse-10',
      title: 'Class 10 CBSE - Board Comprehensive Coaching',
      slug: 'class-10-cbse',
      board: 'CBSE',
      target_class: 'Class 10',
      subjects: 'Mathematics, Science',
      description: 'Comprehensive curriculum coverage aligned with CBSE board guidelines and NCERT textbook mastery.',
      syllabus: 'Full NCERT syllabus, conceptual understanding, periodic mock tests, and sample paper solving.',
      duration: 'Academic Year',
      fee: 'Rs. 18,000 / year',
      batch_info: 'Weekday Batches',
      faculty_name: 'Aniket Gupta',
      order: 4
    },
    {
      id: 'course-11-academic',
      title: 'Class 11 - Academic Coaching',
      slug: 'class-11-coaching',
      board: 'Both',
      target_class: 'Class 11',
      subjects: 'Mathematics, Physics, Chemistry',
      description: 'Rigorous foundation building for higher secondary students across CBSE and State Board.',
      syllabus: 'Core conceptual theory, problem-solving techniques, and foundational preparation for competitive exams.',
      duration: '1 Year',
      fee: 'Rs. 22,000 / year',
      batch_info: 'Evening Batches',
      faculty_name: '',
      order: 5
    },
    {
      id: 'course-12-board',
      title: 'Class 12 - Board Exam Coaching',
      slug: 'class-12-board-coaching',
      board: 'Both',
      target_class: 'Class 12',
      subjects: 'Mathematics, Physics, Chemistry',
      description: 'Targeted coaching for Class 12 board examinations with rigorous practice papers and revision sessions.',
      syllabus: 'Full Class 12 syllabus, previous years question papers (PYQs), revision series, and mock examinations.',
      duration: '1 Year',
      fee: 'Rs. 25,000 / year',
      batch_info: 'Morning & Evening Batches',
      faculty_name: '',
      order: 6
    }
  ];

  for (const c of courseList) {
    run(`INSERT INTO courses (id, title, slug, board, target_class, subjects, description, syllabus, duration, fee, batch_info, faculty_name, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.title, c.slug, c.board, c.target_class, c.subjects, c.description, c.syllabus, c.duration, c.fee, c.batch_info, c.faculty_name, c.order]);
  }

  // 6. Batches
  const batch10M = 'b-10-morning';
  const batch10E = 'b-10-evening';
  run(`INSERT INTO batches (id, course_id, name, schedule, start_date, capacity, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [batch10M, 'course-ssc-10-math', 'Class 10 SSC - Morning Batch', 'Mon-Sat 7:00 AM - 9:00 AM', '2026-06-01', 30, teacherId]);
  run(`INSERT INTO batches (id, course_id, name, schedule, start_date, capacity, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [batch10E, 'course-ssc-10-math', 'Class 10 SSC - Evening Batch', 'Mon-Sat 5:30 PM - 7:30 PM', '2026-06-01', 30, teacherId]);

  // Enroll Rahul Sharma in batch10M
  run(`INSERT INTO batch_enrollments (id, batch_id, student_id) VALUES (?, ?, ?)`,
    ['be-1', batch10M, studentId]);

  // 7. Fees for Rahul Sharma
  const feeId = 'fee-001';
  run(`INSERT INTO fees (id, student_id, batch_id, amount, paid_amount, due_date, status, payment_date, method, receipt_no)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [feeId, studentId, batch10M, 15000, 10000, '2026-07-01', 'partial', '2026-06-15', 'UPI / Online', 'REC-2026-001']);

  run(`INSERT INTO payments (id, fee_id, student_id, amount, payment_date, method, transaction_ref, receipt_no, recorded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pay-001', feeId, studentId, 10000, '2026-06-15', 'UPI', 'UPI-98234871', 'REC-2026-001', adminId]);

  // 8. Attendance records
  const dates = ['2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25'];
  dates.forEach((d, idx) => {
    run(`INSERT INTO attendance (id, student_id, batch_id, date, status, marked_by) VALUES (?, ?, ?, ?, ?, ?)`,
      [`att-${idx + 1}`, studentId, batch10M, d, idx === 2 ? 'absent' : 'present', teacherId]);
  });

  // 9. Exam & Result
  const examId = 'exam-001';
  run(`INSERT INTO exams (id, batch_id, title, subject_id, date, total_marks, passing_marks, is_published, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [examId, batch10M, 'Unit Test 1 - Algebra & Linear Equations', 'sub-1', '2026-09-15', 50, 20, 1, teacherId]);

  run(`INSERT INTO results (id, exam_id, student_id, marks_obtained, grade, remarks, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['res-001', examId, studentId, 46.5, 'A+', 'Outstanding conceptual clarity and neat presentation.', 1]);

  // 10. Study Materials
  run(`INSERT INTO study_materials (id, batch_id, course_id, title, description, file_url, file_type, category, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sm-1', batch10M, 'course-ssc-10-math', 'Class 10 Algebra Chapter 1 - Linear Equations Complete Notes & Formulas', 'Formula sheet and solved textbook questions', '/materials/linear-equations-notes.pdf', 'pdf', 'notes', teacherId]);

  run(`INSERT INTO study_materials (id, batch_id, course_id, title, description, file_url, file_type, category, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['sm-2', batch10M, 'course-ssc-10-math', 'Geometry Theorem Revision Sheet & Diagrams', 'Circles and Pythagoras theorem key proofs', '/materials/geometry-theorems.pdf', 'pdf', 'notes', teacherId]);

  // 11. Notices
  run(`INSERT INTO notices (id, title, content, target_audience, is_published)
    VALUES (?, ?, ?, ?, ?)`,
    ['not-1', 'Upcoming Monthly Mock Assessment', 'All Class 10 students are requested to prepare Chapters 1-4 for the upcoming unit assessment on Friday.', 'all', 1]);

  // 12. Site Settings
  const settings = [
    { key: 'institute_name', value: 'SS Tutorial', desc: 'Institute branding title' },
    { key: 'tagline', value: 'ACHIEVING EXCELLENCE TOGETHER ~', desc: 'Main tagline' },
    { key: 'about', value: 'Welcome to SS TUTORIAL CLASSES - Your Ultimate Math Learning Hub! We simplify complex topics and help you master math with fun, clarity, and confidence. Specializing in SSC Board & CBSE coaching for School Classes up to Class 12.', desc: 'Institute description' },
    { key: 'founder_name', value: 'Ankit Gupta', desc: 'Founder name' },
    { key: 'founder_title', value: 'Founder & Director', desc: 'Founder title' },
    { key: 'founder_bio', value: 'Dedicated educator and founder of SS Tutorial, passionate about simplifying mathematics and guiding students toward academic excellence through conceptual clarity and disciplined practice.', desc: 'Founder biography' },
    { key: 'founder_image_url', value: '/founder.jpg', desc: 'Founder profile image' },
    { key: 'notice_ticker', value: "Education Can't SNATCH By Anyone ~ Admissions Open for Class 6 to 12 (CBSE & SSC)", desc: 'Top notice bar' },
    { key: 'address', value: '002, (B) WING, VEER 10, UMROLI (EAST)', desc: 'Official institute address' },
    { key: 'youtube_url', value: 'https://www.youtube.com/@SS__tutorial2025', desc: 'Official YouTube channel' },
    { key: 'instagram_url', value: 'https://www.instagram.com/ss__tutorial', desc: 'Official Instagram profile' },
    { key: 'whatsapp_number', value: '9876543210', desc: 'WhatsApp support number' },
    { key: 'phone', value: '9876543210', desc: 'Primary contact phone' },
    { key: 'email', value: 'contact@sstutorial.com', desc: 'Official contact email' },
    { key: 'working_hours', value: 'Mon - Sat: 8:00 AM - 8:00 PM', desc: 'Office working hours' }
  ];

  for (const st of settings) {
    run(`INSERT OR REPLACE INTO site_settings (key, value, description) VALUES (?, ?, ?)`, [st.key, st.value, st.desc]);
  }

  console.log('Database seeded successfully!');
};
