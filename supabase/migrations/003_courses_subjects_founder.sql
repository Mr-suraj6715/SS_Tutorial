-- Migration 003: Courses enhancements and Subjects table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS board TEXT NOT NULL DEFAULT 'Both';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS target_class TEXT NOT NULL DEFAULT 'School Classes';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS subjects TEXT NOT NULL DEFAULT '';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS faculty_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS batch_info TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT '',
    code TEXT NOT NULL DEFAULT '',
    board TEXT NOT NULL DEFAULT 'CBSE',
    target_class TEXT NOT NULL DEFAULT 'School Classes',
    description TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subjects' AND policyname = 'Anyone can view active subjects'
  ) THEN
    CREATE POLICY "Anyone can view active subjects" ON public.subjects FOR SELECT USING (is_active = TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subjects' AND policyname = 'Admins have full access to subjects'
  ) THEN
    CREATE POLICY "Admins have full access to subjects" ON public.subjects FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role IN ('admin', 'moderator')
      )
    );
  END IF;
END $$;
