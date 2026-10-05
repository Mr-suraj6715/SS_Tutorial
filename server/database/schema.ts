import { exec } from './connection';

export const initSchema = () => {
  exec(`
    -- 1. USERS & PROFILES
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      role TEXT NOT NULL DEFAULT 'student',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, role)
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      avatar_url TEXT DEFAULT '',
      role TEXT NOT NULL DEFAULT 'student',
      bio TEXT DEFAULT '',
      address TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 2. ACADEMIC ENTITIES
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      standard TEXT NOT NULL DEFAULT '',
      board TEXT NOT NULL DEFAULT 'SSC',
      description TEXT DEFAULT '',
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL DEFAULT '',
      board TEXT NOT NULL DEFAULT 'SSC',
      target_class TEXT NOT NULL DEFAULT 'Class 10',
      description TEXT DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      board TEXT NOT NULL DEFAULT 'Both',
      target_class TEXT NOT NULL DEFAULT 'School Classes',
      subjects TEXT DEFAULT '',
      description TEXT DEFAULT '',
      syllabus TEXT DEFAULT '',
      duration TEXT DEFAULT '',
      fee TEXT DEFAULT '',
      batch_info TEXT DEFAULT '',
      faculty_name TEXT DEFAULT '',
      category TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS batches (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      schedule TEXT DEFAULT '',
      start_date TEXT,
      end_date TEXT,
      capacity INTEGER NOT NULL DEFAULT 30,
      teacher_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 3. STUDENTS & PARENTS & TEACHERS
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      roll_no TEXT DEFAULT '',
      class_name TEXT DEFAULT 'Class 10',
      board TEXT DEFAULT 'SSC',
      parent_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      admission_date TEXT,
      status TEXT NOT NULL DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS parents (
      id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      occupation TEXT DEFAULT '',
      alternate_phone TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS parent_student_links (
      id TEXT PRIMARY KEY,
      parent_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(parent_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      qualification TEXT DEFAULT '',
      experience_years INTEGER DEFAULT 0,
      specialization TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS teacher_assignments (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
      subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
      batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS batch_enrollments (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(batch_id, student_id)
    );

    -- 4. ADMISSIONS
    CREATE TABLE IF NOT EXISTS admissions (
      id TEXT PRIMARY KEY,
      student_name TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT DEFAULT '',
      course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
      batch_id TEXT REFERENCES batches(id) ON DELETE SET NULL,
      target_class TEXT DEFAULT 'Class 10',
      board TEXT DEFAULT 'SSC',
      previous_marks TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      rejection_reason TEXT DEFAULT '',
      documents TEXT DEFAULT '[]',
      applied_at TEXT NOT NULL DEFAULT (datetime('now')),
      reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 5. FEES & PAYMENTS
    CREATE TABLE IF NOT EXISTS fees (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      amount REAL NOT NULL DEFAULT 0.0,
      paid_amount REAL NOT NULL DEFAULT 0.0,
      due_date TEXT,
      status TEXT NOT NULL DEFAULT 'unpaid',
      payment_date TEXT,
      method TEXT DEFAULT '',
      remarks TEXT DEFAULT '',
      receipt_no TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      fee_id TEXT NOT NULL REFERENCES fees(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount REAL NOT NULL DEFAULT 0.0,
      payment_date TEXT NOT NULL DEFAULT (datetime('now')),
      method TEXT NOT NULL DEFAULT 'Cash',
      transaction_ref TEXT DEFAULT '',
      receipt_no TEXT NOT NULL UNIQUE,
      recorded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 6. ATTENDANCE
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'present',
      remarks TEXT DEFAULT '',
      marked_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(student_id, batch_id, date)
    );

    -- 7. EXAMS & RESULTS
    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
      date TEXT NOT NULL,
      total_marks REAL NOT NULL DEFAULT 100.0,
      passing_marks REAL NOT NULL DEFAULT 35.0,
      is_published INTEGER NOT NULL DEFAULT 0,
      created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS results (
      id TEXT PRIMARY KEY,
      exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      marks_obtained REAL NOT NULL DEFAULT 0.0,
      grade TEXT DEFAULT '',
      remarks TEXT DEFAULT '',
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(exam_id, student_id)
    );

    -- 8. STUDY MATERIALS & ASSIGNMENTS
    CREATE TABLE IF NOT EXISTS study_materials (
      id TEXT PRIMARY KEY,
      batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
      course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      file_url TEXT NOT NULL,
      file_type TEXT DEFAULT 'pdf',
      category TEXT NOT NULL DEFAULT 'notes',
      uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      due_date TEXT,
      file_url TEXT DEFAULT '',
      created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assignment_submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      file_url TEXT NOT NULL,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      marks REAL DEFAULT NULL,
      feedback TEXT DEFAULT '',
      UNIQUE(assignment_id, student_id)
    );

    -- 9. NOTICES & EVENTS
    CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      target_audience TEXT NOT NULL DEFAULT 'all',
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      event_date TEXT NOT NULL,
      location TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 10. CONTENT MANAGEMENT & SETTINGS
    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      title TEXT DEFAULT '',
      caption TEXT DEFAULT '',
      alt_text TEXT DEFAULT '',
      image_url TEXT NOT NULL,
      thumbnail_url TEXT DEFAULT '',
      webp_url TEXT DEFAULT '',
      placement TEXT NOT NULL DEFAULT 'gallery',
      display_order INTEGER NOT NULL DEFAULT 0,
      instagram_post_url TEXT DEFAULT '',
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT DEFAULT '',
      content TEXT NOT NULL,
      cover_url TEXT DEFAULT '',
      author TEXT DEFAULT 'SS Tutorial',
      published_at TEXT DEFAULT (datetime('now')),
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      url TEXT NOT NULL,
      platform TEXT NOT NULL DEFAULT 'youtube',
      embed_url TEXT DEFAULT '',
      thumbnail TEXT DEFAULT '',
      display_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      student_name TEXT NOT NULL,
      course TEXT DEFAULT '',
      text TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      photo_url TEXT DEFAULT '',
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS facilities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT NOT NULL DEFAULT 'BookOpen',
      image_url TEXT DEFAULT '',
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      date TEXT,
      category TEXT DEFAULT '',
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS faculty (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      designation TEXT NOT NULL DEFAULT '',
      bio TEXT DEFAULT '',
      photo_url TEXT DEFAULT '',
      subjects TEXT DEFAULT '',
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      subject TEXT DEFAULT '',
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      description TEXT DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- INDEXES FOR FAST PERFORMANCE
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
    CREATE INDEX IF NOT EXISTS idx_batches_course ON batches(course_id);
    CREATE INDEX IF NOT EXISTS idx_enroll_batch ON batch_enrollments(batch_id);
    CREATE INDEX IF NOT EXISTS idx_enroll_student ON batch_enrollments(student_id);
    CREATE INDEX IF NOT EXISTS idx_att_batch_date ON attendance(batch_id, date);
    CREATE INDEX IF NOT EXISTS idx_att_student ON attendance(student_id);
    CREATE INDEX IF NOT EXISTS idx_fees_student ON fees(student_id);
    CREATE INDEX IF NOT EXISTS idx_results_exam ON results(exam_id);
    CREATE INDEX IF NOT EXISTS idx_results_student ON results(student_id);
    CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);
  `);
  console.log('Database schema initialized successfully');
};
