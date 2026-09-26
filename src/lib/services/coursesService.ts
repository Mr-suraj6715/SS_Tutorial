import { supabase } from '../supabase/client'

export type BoardType = 'CBSE' | 'SSC' | 'Both'
export type ClassCategory = 'School Classes' | 'Class 11' | 'Class 12'

export interface AcademicSubject {
  id: string
  name: string
  code: string
  board: BoardType
  target_class: string
  description: string
  is_active: boolean
  display_order: number
  created_at?: string
  updated_at?: string
}

export interface AcademicCourse {
  id: string
  title: string
  slug: string
  board: BoardType
  target_class: string
  subjects: string
  description: string
  syllabus: string
  duration: string
  fee: string
  batch_info: string
  faculty_name: string
  category: string
  image_url: string
  is_active: boolean
  display_order: number
  created_at?: string
  updated_at?: string
}

const COURSES_STORAGE_KEY = 'ss_tutorial_courses'
const SUBJECTS_STORAGE_KEY = 'ss_tutorial_subjects'

export const DEFAULT_STARTER_COURSES: AcademicCourse[] = [
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
    fee: 'Contact for details',
    batch_info: 'Morning & Evening Batches Available',
    faculty_name: 'Aniket Gupta',
    category: 'Class 10',
    image_url: '',
    is_active: true,
    display_order: 1,
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
    fee: 'Contact for details',
    batch_info: 'Regular Batches',
    faculty_name: 'Aniket Gupta',
    category: 'Class 9',
    image_url: '',
    is_active: true,
    display_order: 2,
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
    fee: 'Contact for details',
    batch_info: 'Regular Batches',
    faculty_name: 'Aniket Gupta',
    category: 'Class 8',
    image_url: '',
    is_active: true,
    display_order: 3,
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
    fee: 'Contact for details',
    batch_info: 'Weekday Batches',
    faculty_name: '',
    category: 'Class 10',
    image_url: '',
    is_active: true,
    display_order: 4,
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
    fee: 'Contact for details',
    batch_info: 'Evening Batches',
    faculty_name: '',
    category: 'Class 11',
    image_url: '',
    is_active: true,
    display_order: 5,
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
    fee: 'Contact for details',
    batch_info: 'Morning & Evening Batches',
    faculty_name: '',
    category: 'Class 12',
    image_url: '',
    is_active: true,
    display_order: 6,
  },
]

export const DEFAULT_STARTER_SUBJECTS: AcademicSubject[] = [
  { id: 'subj-1', name: 'Mathematics Part I (Algebra)', code: 'MATH-1', board: 'SSC', target_class: 'Class 10', description: 'Algebra, Equations, Financial Planning & Statistics', is_active: true, display_order: 1 },
  { id: 'subj-2', name: 'Mathematics Part II (Geometry)', code: 'MATH-2', board: 'SSC', target_class: 'Class 10', description: 'Geometry, Trigonometry, Coordinate Geometry & Mensuration', is_active: true, display_order: 2 },
  { id: 'subj-3', name: 'Science & Technology', code: 'SCI', board: 'SSC', target_class: 'Class 10', description: 'Physics, Chemistry & Biology concepts', is_active: true, display_order: 3 },
  { id: 'subj-4', name: 'Mathematics Part I', code: 'MATH-9-1', board: 'SSC', target_class: 'Class 9', description: 'Sets, Real Numbers, Polynomials & Algebra', is_active: true, display_order: 4 },
  { id: 'subj-5', name: 'Mathematics Part II', code: 'MATH-9-2', board: 'SSC', target_class: 'Class 9', description: 'Geometry, Triangles, Quadrilaterals & Circle', is_active: true, display_order: 5 },
  { id: 'subj-6', name: 'Mathematics', code: 'MATH-CBSE-10', board: 'CBSE', target_class: 'Class 10', description: 'NCERT Curriculum Mathematics', is_active: true, display_order: 6 },
  { id: 'subj-7', name: 'Science', code: 'SCI-CBSE-10', board: 'CBSE', target_class: 'Class 10', description: 'NCERT Curriculum Science', is_active: true, display_order: 7 },
  { id: 'subj-8', name: 'Mathematics', code: 'MATH-11', board: 'Both', target_class: 'Class 11', description: 'Class 11 Higher Secondary Mathematics', is_active: true, display_order: 8 },
  { id: 'subj-9', name: 'Mathematics', code: 'MATH-12', board: 'Both', target_class: 'Class 12', description: 'Class 12 Higher Secondary Mathematics', is_active: true, display_order: 9 },
]

export const getStoredCourses = (): AcademicCourse[] => {
  try {
    const raw = localStorage.getItem(COURSES_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
    return DEFAULT_STARTER_COURSES
  } catch {
    return DEFAULT_STARTER_COURSES
  }
}

export const setStoredCourses = (courses: AcademicCourse[]) => {
  try {
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses))
  } catch {
    // ignore
  }
}

export const getStoredSubjects = (): AcademicSubject[] => {
  try {
    const raw = localStorage.getItem(SUBJECTS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
    return DEFAULT_STARTER_SUBJECTS
  } catch {
    return DEFAULT_STARTER_SUBJECTS
  }
}

export const setStoredSubjects = (subjects: AcademicSubject[]) => {
  try {
    localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjects))
  } catch {
    // ignore
  }
}

// Fetch Courses with DB + Local Storage sync
export const fetchAcademicCourses = async (): Promise<AcademicCourse[]> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('display_order', { ascending: true })

    if (error || !data) {
      return getStoredCourses()
    }

    const normalized: AcademicCourse[] = data.map((item: any) => ({
      id: item.id,
      title: item.title || '',
      slug: item.slug || (item.title || 'course').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      board: item.board || 'Both',
      target_class: item.target_class || item.category || 'School Classes',
      subjects: item.subjects || '',
      description: item.description || '',
      syllabus: item.syllabus || '',
      duration: item.duration || '',
      fee: item.fee || '',
      batch_info: item.batch_info || '',
      faculty_name: item.faculty_name || '',
      category: item.category || item.target_class || '',
      image_url: item.image_url || '',
      is_active: item.is_active !== false,
      display_order: item.display_order || 0,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }))

    // Save to local storage cache
    setStoredCourses(normalized)
    return normalized
  } catch (err) {
    console.warn('Error fetching courses from DB, using cache:', err)
    return getStoredCourses()
  }
}

// Save or Update Course
export const saveAcademicCourse = async (course: Partial<AcademicCourse>): Promise<AcademicCourse> => {
  const isNew = !course.id
  const courseId = course.id || crypto.randomUUID()
  const slug = course.slug || (course.title || 'course').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const record: AcademicCourse = {
    id: courseId,
    title: course.title || '',
    slug: slug || 'course-' + Date.now(),
    board: (course.board as BoardType) || 'Both',
    target_class: course.target_class || 'School Classes',
    subjects: course.subjects || '',
    description: course.description || '',
    syllabus: course.syllabus || '',
    duration: course.duration || '',
    fee: course.fee || '',
    batch_info: course.batch_info || '',
    faculty_name: course.faculty_name || '',
    category: course.target_class || '',
    image_url: course.image_url || '',
    is_active: course.is_active !== undefined ? course.is_active : true,
    display_order: course.display_order || 0,
    updated_at: new Date().toISOString(),
    created_at: course.created_at || new Date().toISOString(),
  }

  // Update local storage cache immediately
  const localList = getStoredCourses()
  const existingIdx = localList.findIndex((c) => c.id === courseId)
  if (existingIdx >= 0) {
    localList[existingIdx] = record
  } else {
    localList.push(record)
  }
  setStoredCourses(localList)

  // Sync with Supabase
  try {
    const payload = {
      id: record.id,
      title: record.title,
      slug: record.slug,
      board: record.board,
      target_class: record.target_class,
      subjects: record.subjects,
      description: record.description,
      syllabus: record.syllabus,
      duration: record.duration,
      fee: record.fee,
      batch_info: record.batch_info,
      faculty_name: record.faculty_name,
      category: record.category,
      image_url: record.image_url,
      is_active: record.is_active,
      display_order: record.display_order,
      updated_at: record.updated_at,
    }

    if (isNew) {
      await supabase.from('courses').insert(payload)
    } else {
      await supabase.from('courses').update(payload).eq('id', record.id)
    }
  } catch (err) {
    console.warn('Could not sync course with Supabase, kept in local store:', err)
  }

  return record
}

// Delete Course
export const deleteAcademicCourse = async (id: string): Promise<void> => {
  const localList = getStoredCourses().filter((c) => c.id !== id)
  setStoredCourses(localList)

  try {
    await supabase.from('courses').delete().eq('id', id)
  } catch (err) {
    console.warn('Could not delete course from Supabase:', err)
  }
}

// Fetch Subjects with DB + Local Storage sync
export const fetchAcademicSubjects = async (): Promise<AcademicSubject[]> => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('display_order', { ascending: true })

    if (error || !data) {
      return getStoredSubjects()
    }

    const normalized: AcademicSubject[] = data.map((item: any) => ({
      id: item.id,
      name: item.name || '',
      code: item.code || '',
      board: item.board || 'CBSE',
      target_class: item.target_class || 'School Classes',
      description: item.description || '',
      is_active: item.is_active !== false,
      display_order: item.display_order || 0,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }))

    setStoredSubjects(normalized)
    return normalized
  } catch (err) {
    console.warn('Error fetching subjects from DB, using cache:', err)
    return getStoredSubjects()
  }
}

// Save or Update Subject
export const saveAcademicSubject = async (subject: Partial<AcademicSubject>): Promise<AcademicSubject> => {
  const isNew = !subject.id
  const subjectId = subject.id || crypto.randomUUID()

  const record: AcademicSubject = {
    id: subjectId,
    name: subject.name || '',
    code: subject.code || '',
    board: (subject.board as BoardType) || 'CBSE',
    target_class: subject.target_class || 'School Classes',
    description: subject.description || '',
    is_active: subject.is_active !== undefined ? subject.is_active : true,
    display_order: subject.display_order || 0,
    updated_at: new Date().toISOString(),
    created_at: subject.created_at || new Date().toISOString(),
  }

  // Update local storage cache immediately
  const localList = getStoredSubjects()
  const existingIdx = localList.findIndex((s) => s.id === subjectId)
  if (existingIdx >= 0) {
    localList[existingIdx] = record
  } else {
    localList.push(record)
  }
  setStoredSubjects(localList)

  // Sync with Supabase
  try {
    const payload = {
      id: record.id,
      name: record.name,
      code: record.code,
      board: record.board,
      target_class: record.target_class,
      description: record.description,
      is_active: record.is_active,
      display_order: record.display_order,
      updated_at: record.updated_at,
    }

    if (isNew) {
      await supabase.from('subjects').insert(payload)
    } else {
      await supabase.from('subjects').update(payload).eq('id', record.id)
    }
  } catch (err) {
    console.warn('Could not sync subject with Supabase, kept in local store:', err)
  }

  return record
}

// Delete Subject
export const deleteAcademicSubject = async (id: string): Promise<void> => {
  const localList = getStoredSubjects().filter((s) => s.id !== id)
  setStoredSubjects(localList)

  try {
    await supabase.from('subjects').delete().eq('id', id)
  } catch (err) {
    console.warn('Could not delete subject from Supabase:', err)
  }
}
