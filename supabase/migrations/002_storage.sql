-- ==============================================================================
-- SS TUTORIAL STORAGE BUCKETS & RLS POLICIES
-- ==============================================================================

-- 1. Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('media', 'media', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']),
    ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policies for 'media' (Public images: logos, hero, gallery, faculty, etc.)
CREATE POLICY "Public Read Media"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'media');

CREATE POLICY "Admin Upload Media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media' AND (SELECT private.is_admin()));

CREATE POLICY "Admin Update Media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND (SELECT private.is_admin()));

CREATE POLICY "Admin Delete Media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND (SELECT private.is_admin()));

-- 3. Storage RLS Policies for 'documents' (Admission documents, Study materials)
CREATE POLICY "Applicants and Admins upload documents"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Admins and Teachers read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'documents' AND (
        (SELECT private.is_admin())
        OR (SELECT private.has_role('teacher'))
        OR (SELECT private.has_role('student'))
    )
);

CREATE POLICY "Admins manage documents"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'documents' AND (SELECT private.is_admin()))
WITH CHECK (bucket_id = 'documents' AND (SELECT private.is_admin()));
