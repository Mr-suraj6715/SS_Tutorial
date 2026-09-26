-- ==============================================================================
-- SS TUTORIAL DATABASE SCHEMA
-- Supabase PostgreSQL with Granular Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS & PRIVATE SCHEMA FOR SECURITY DEFINER HELPERS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS private;

-- 2. USER ROLES ENUMS & TABLES
-- Distinct table for RBAC: Never store roles for authorization directly on profiles.
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'teacher', 'student', 'parent');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
CREATE TYPE fee_status AS ENUM ('paid', 'partial', 'unpaid');
CREATE TYPE admission_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE gallery_placement AS ENUM ('gallery', 'hero', 'classroom', 'results');
CREATE TYPE video_platform AS ENUM ('youtube', 'instagram');
CREATE TYPE import_status AS ENUM ('queued', 'processing', 'completed', 'failed');

-- Profiles table (links directly to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    avatar_url TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User roles table (authoritative authorization source)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

-- Index for fast role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- SECURITY DEFINER function to check if current user has a specific role safely
CREATE OR REPLACE FUNCTION private.has_role(role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = (SELECT auth.uid())
          AND role = role_name
    );
END;
$$;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = (SELECT auth.uid())
          AND (role = 'admin' OR role = 'moderator')
    );
END;
$$;

-- 3. SITE SETTINGS (Key/Value configuration store)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. COURSES
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL DEFAULT '',
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    syllabus TEXT NOT NULL DEFAULT '',
    duration TEXT NOT NULL DEFAULT '',
    fee TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BATCHES
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    schedule TEXT NOT NULL DEFAULT '',
    start_date DATE,
    end_date DATE,
    capacity INTEGER NOT NULL DEFAULT 0,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ADMISSIONS
CREATE TABLE IF NOT EXISTS public.admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_name TEXT NOT NULL DEFAULT '',
    parent_name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    rejection_reason TEXT DEFAULT '',
    documents TEXT[] DEFAULT ARRAY[]::TEXT[],
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ATTENDANCE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'present',
    marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_student_batch_date UNIQUE (student_id, batch_id, date)
);

-- 8. FEES
CREATE TABLE IF NOT EXISTS public.fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'unpaid',
    payment_date DATE,
    method TEXT DEFAULT '',
    remarks TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. EXAMS
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_marks NUMERIC(5, 2) NOT NULL DEFAULT 100,
    passing_marks NUMERIC(5, 2) NOT NULL DEFAULT 35,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. RESULTS
CREATE TABLE IF NOT EXISTS public.results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    marks_obtained NUMERIC(5, 2) NOT NULL DEFAULT 0,
    grade TEXT DEFAULT '',
    remarks TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_exam_student UNIQUE (exam_id, student_id)
);

-- 11. STUDY MATERIALS
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    file_url TEXT NOT NULL DEFAULT '',
    file_type TEXT NOT NULL DEFAULT '',
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. BLOGS
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL DEFAULT '',
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    cover_url TEXT NOT NULL DEFAULT '',
    author TEXT NOT NULL DEFAULT '',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. GALLERY
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL DEFAULT '',
    caption TEXT NOT NULL DEFAULT '',
    alt_text TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    thumbnail_url TEXT NOT NULL DEFAULT '',
    webp_url TEXT NOT NULL DEFAULT '',
    placement TEXT NOT NULL DEFAULT 'gallery',
    display_order INTEGER NOT NULL DEFAULT 0,
    instagram_post_url TEXT DEFAULT '',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. VIDEOS
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    url TEXT NOT NULL DEFAULT '',
    platform TEXT NOT NULL DEFAULT 'youtube',
    embed_url TEXT NOT NULL DEFAULT '',
    thumbnail TEXT NOT NULL DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_name TEXT NOT NULL DEFAULT '',
    course TEXT NOT NULL DEFAULT '',
    text TEXT NOT NULL DEFAULT '',
    rating INTEGER NOT NULL DEFAULT 5,
    photo_url TEXT NOT NULL DEFAULT '',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    date DATE,
    category TEXT NOT NULL DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. FACILITIES
CREATE TABLE IF NOT EXISTS public.facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'BookOpen',
    image_url TEXT NOT NULL DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. FACULTY
CREATE TABLE IF NOT EXISTS public.faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT '',
    designation TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    photo_url TEXT NOT NULL DEFAULT '',
    subjects TEXT NOT NULL DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. INSTAGRAM IMPORTS
CREATE TABLE IF NOT EXISTS public.instagram_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    attempts INTEGER NOT NULL DEFAULT 0,
    failure_reason TEXT DEFAULT '',
    gallery_id UUID REFERENCES public.gallery(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. MESSAGES (Contact Form Inquiries)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    subject TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. PARENT-STUDENT LINK TABLE (For parent dashboard association)
CREATE TABLE IF NOT EXISTS public.parent_student_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_parent_student UNIQUE (parent_id, student_id)
);

-- 22. ENROLLMENTS (Links students to batches)
CREATE TABLE IF NOT EXISTS public.batch_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_batch_student UNIQUE (batch_id, student_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_enrollments ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public profiles are readable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Admins have full access to profiles"
ON public.profiles FOR ALL
TO authenticated
USING ((SELECT private.is_admin()));

-- ------------------------------------------------------------------------------
-- USER ROLES POLICIES (Strictly Admin managed)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can read their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()) OR (SELECT private.is_admin()));

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- ------------------------------------------------------------------------------
-- SITE SETTINGS POLICIES (Public read, admin write)
-- ------------------------------------------------------------------------------
CREATE POLICY "Public read site_settings"
ON public.site_settings FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins manage site_settings"
ON public.site_settings FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- ------------------------------------------------------------------------------
-- COURSES POLICIES (Public read active, admin full)
-- ------------------------------------------------------------------------------
CREATE POLICY "Public read active courses"
ON public.courses FOR SELECT
TO anon, authenticated
USING (is_active = true OR (SELECT private.is_admin()));

CREATE POLICY "Admins manage courses"
ON public.courses FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- ------------------------------------------------------------------------------
-- BATCHES POLICIES (Public/students read active, teachers read assigned, admin full)
-- ------------------------------------------------------------------------------
CREATE POLICY "Public read active batches"
ON public.batches FOR SELECT
TO anon, authenticated
USING (is_active = true OR teacher_id = (SELECT auth.uid()) OR (SELECT private.is_admin()));

CREATE POLICY "Teachers can view and update their batches"
ON public.batches FOR UPDATE
TO authenticated
USING (teacher_id = (SELECT auth.uid()) OR (SELECT private.is_admin()))
WITH CHECK (teacher_id = (SELECT auth.uid()) OR (SELECT private.is_admin()));

CREATE POLICY "Admins manage batches"
ON public.batches FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- ------------------------------------------------------------------------------
-- ADMISSIONS POLICIES (Anyone can apply, applicants see own, admin manages)
-- ------------------------------------------------------------------------------
CREATE POLICY "Anyone can submit admission application"
ON public.admissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Applicants can read their own admissions by email or phone"
ON public.admissions FOR SELECT
TO authenticated
USING (
    email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR (SELECT private.is_admin())
);

CREATE POLICY "Admins manage admissions"
ON public.admissions FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- ------------------------------------------------------------------------------
-- ATTENDANCE POLICIES (Students/Parents view own, teachers mark, admin full)
-- ------------------------------------------------------------------------------
CREATE POLICY "Students view own attendance"
ON public.attendance FOR SELECT
TO authenticated
USING (
    student_id = (SELECT auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.parent_student_links
        WHERE parent_id = (SELECT auth.uid()) AND student_id = public.attendance.student_id
    )
    OR EXISTS (
        SELECT 1 FROM public.batches
        WHERE id = public.attendance.batch_id AND teacher_id = (SELECT auth.uid())
    )
    OR (SELECT private.is_admin())
);

CREATE POLICY "Teachers and admins can insert/update attendance"
ON public.attendance FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.batches
        WHERE id = public.attendance.batch_id AND teacher_id = (SELECT auth.uid())
    )
    OR (SELECT private.is_admin())
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.batches
        WHERE id = public.attendance.batch_id AND teacher_id = (SELECT auth.uid())
    )
    OR (SELECT private.is_admin())
);

-- ------------------------------------------------------------------------------
-- FEES POLICIES (Students/Parents view own, admins manage)
-- ------------------------------------------------------------------------------
CREATE POLICY "Students and parents view own fees"
ON public.fees FOR SELECT
TO authenticated
USING (
    student_id = (SELECT auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.parent_student_links
        WHERE parent_id = (SELECT auth.uid()) AND student_id = public.fees.student_id
    )
    OR (SELECT private.is_admin())
);

CREATE POLICY "Admins manage fees"
ON public.fees FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- ------------------------------------------------------------------------------
-- EXAMS POLICIES (Enrolled students/teachers view, admins manage)
-- ------------------------------------------------------------------------------
CREATE POLICY "Enrolled students, teachers and admins view exams"
ON public.exams FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.batch_enrollments
        WHERE batch_id = public.exams.batch_id AND student_id = (SELECT auth.uid())
    )
    OR EXISTS (
        SELECT 1 FROM public.batches
        WHERE id = public.exams.batch_id AND teacher_id = (SELECT auth.uid())
    )
    OR (SELECT private.is_admin())
);

CREATE POLICY "Teachers and admins manage exams"
ON public.exams FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.batches
        WHERE id = public.exams.batch_id AND teacher_id = (SELECT auth.uid())
    )
    OR (SELECT private.is_admin())
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.batches
        WHERE id = public.exams.batch_id AND teacher_id = (SELECT auth.uid())
    )
    OR (SELECT private.is_admin())
);

-- ------------------------------------------------------------------------------
-- RESULTS POLICIES (Students/Parents view own, teachers enter, admins manage)
-- ------------------------------------------------------------------------------
CREATE POLICY "Students and parents view results"
ON public.results FOR SELECT
TO authenticated
USING (
    student_id = (SELECT auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.parent_student_links
        WHERE parent_id = (SELECT auth.uid()) AND student_id = public.results.student_id
    )
    OR (SELECT private.is_admin())
);

CREATE POLICY "Teachers and admins manage results"
ON public.results FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.exams e
        JOIN public.batches b ON b.id = e.batch_id
        WHERE e.id = public.results.exam_id AND b.teacher_id = (SELECT auth.uid())
    )
    OR (SELECT private.is_admin())
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.exams e
        JOIN public.batches b ON b.id = e.batch_id
        WHERE e.id = public.results.exam_id AND b.teacher_id = (SELECT auth.uid())
    )
    OR (SELECT private.is_admin())
);

-- ------------------------------------------------------------------------------
-- STUDY MATERIALS POLICIES (Enrolled students read, teachers upload, admin manage)
-- ------------------------------------------------------------------------------
CREATE POLICY "Enrolled students read study materials"
ON public.study_materials FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.batch_enrollments
        WHERE batch_id = public.study_materials.batch_id AND student_id = (SELECT auth.uid())
    )
    OR EXISTS (
        SELECT 1 FROM public.batches
        WHERE id = public.study_materials.batch_id AND teacher_id = (SELECT auth.uid())
    )
    OR (SELECT private.is_admin())
);

CREATE POLICY "Teachers and admins manage study materials"
ON public.study_materials FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.batches
        WHERE id = public.study_materials.batch_id AND teacher_id = (SELECT auth.uid())
    )
    OR (SELECT private.is_admin())
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.batches
        WHERE id = public.study_materials.batch_id AND teacher_id = (SELECT auth.uid())
    )
    OR (SELECT private.is_admin())
);

-- ------------------------------------------------------------------------------
-- PUBLIC CONTENT POLICIES (Blogs, Gallery, Videos, Testimonials, Facilities, Faculty, Achievements)
-- ------------------------------------------------------------------------------
-- Blogs
CREATE POLICY "Public read published blogs"
ON public.blogs FOR SELECT
TO anon, authenticated
USING (is_published = true OR (SELECT private.is_admin()));

CREATE POLICY "Admins manage blogs"
ON public.blogs FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- Gallery
CREATE POLICY "Public read published gallery"
ON public.gallery FOR SELECT
TO anon, authenticated
USING (is_published = true OR (SELECT private.is_admin()));

CREATE POLICY "Admins manage gallery"
ON public.gallery FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- Videos
CREATE POLICY "Public read active videos"
ON public.videos FOR SELECT
TO anon, authenticated
USING (is_active = true OR (SELECT private.is_admin()));

CREATE POLICY "Admins manage videos"
ON public.videos FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- Testimonials
CREATE POLICY "Public read published testimonials"
ON public.testimonials FOR SELECT
TO anon, authenticated
USING (is_published = true OR (SELECT private.is_admin()));

CREATE POLICY "Admins manage testimonials"
ON public.testimonials FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- Achievements
CREATE POLICY "Public read achievements"
ON public.achievements FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins manage achievements"
ON public.achievements FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- Facilities
CREATE POLICY "Public read facilities"
ON public.facilities FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins manage facilities"
ON public.facilities FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- Faculty
CREATE POLICY "Public read faculty"
ON public.faculty FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins manage faculty"
ON public.faculty FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- Instagram Imports (Admin only)
CREATE POLICY "Admins manage instagram imports"
ON public.instagram_imports FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- Messages (Public insert, admin view/manage)
CREATE POLICY "Anyone can send message"
ON public.messages FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins manage messages"
ON public.messages FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- Parent Student Links & Enrollments (Admins manage)
CREATE POLICY "Admins manage parent student links"
ON public.parent_student_links FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "Admins manage enrollments"
ON public.batch_enrollments FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- ------------------------------------------------------------------------------
-- GRANTS FOR ROLES
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.admissions TO anon, authenticated;
GRANT INSERT ON public.messages TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
