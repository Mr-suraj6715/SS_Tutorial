# SS Tutorial Coaching Institute Website - Specification

Status: FINALIZED

## 1. Overview
Complete, professional, production-ready full-stack coaching institute website for **SS Tutorial** (@ss__tutorial on Instagram).
All institute details are fully dynamic and manageable by an admin via dashboard — no hardcoded address, phone, faculty, courses, fees, or achievements. Initial database seeded with placeholder/empty strings.

## 2. Tech Stack
- **Framework:** TanStack Start v1 (React 19, SSR)
- **Bundler:** Vite 7
- **Styling:** Tailwind CSS v4 (CSS-first configuration with Deep Green + Amber palette)
- **Backend / BaaS:** Lovable Cloud / Supabase (PostgreSQL, Auth, Storage)
- **UI Components:** shadcn/ui components, Radix UI primitives, lucide-react icons
- **Authentication:** Supabase Auth (Email/Password + Google OAuth) with Role-Based Access Control (RBAC) via separate `user_roles` table and `private.has_role()` security-definer function

## 3. Database Schema (19 Tables + Messages Table + RLS + Storage)
1. `profiles`: id (FK auth.users), full_name, phone, role (student/parent/teacher/admin), created_at, updated_at
2. `user_roles`: id, user_id (FK auth.users), role (admin/moderator/user), created_at
3. `site_settings`: key (PK), value, description, updated_at
4. `courses`: id, title, slug, description, syllabus, duration, fee, category, image_url, is_active, display_order, created_at
5. `batches`: id, course_id (FK courses), name, schedule, start_date, end_date, capacity, teacher_id (FK profiles), is_active, created_at
6. `admissions`: id, student_name, parent_name, phone, email, address, course_id (FK courses), batch_id (FK batches), status (pending/approved/rejected), rejection_reason, documents (text[]), applied_at, reviewed_by (FK profiles)
7. `attendance`: id, student_id (FK profiles), batch_id (FK batches), date, status (present/absent/late), marked_by (FK profiles), created_at
8. `fees`: id, student_id (FK profiles), batch_id (FK batches), amount, paid_amount, due_date, status (paid/partial/unpaid), payment_date, method, remarks, created_at
9. `exams`: id, batch_id (FK batches), title, date, total_marks, passing_marks, created_at
10. `results`: id, exam_id (FK exams), student_id (FK profiles), marks_obtained, grade, remarks, created_at
11. `study_materials`: id, batch_id (FK batches), title, description, file_url, file_type, uploaded_by (FK profiles), uploaded_at
12. `blogs`: id, title, slug, excerpt, content, cover_url, author, published_at, is_published, created_at
13. `gallery`: id, title, caption, alt_text, image_url, thumbnail_url, webp_url, placement (gallery/hero/classroom/results), display_order, instagram_post_url, is_published, created_at
14. `videos`: id, title, description, url, platform (youtube/instagram), embed_url, thumbnail, display_order, is_active, created_at
15. `testimonials`: id, student_name, course, text, rating, photo_url, is_published, created_at
16. `achievements`: id, title, description, image_url, date, category, created_at
17. `facilities`: id, title, description, icon, image_url, display_order, created_at
18. `faculty`: id, name, designation, bio, photo_url, subjects, display_order, created_at
19. `instagram_imports`: id, url, status (queued/processing/completed/failed), attempts, failure_reason, gallery_id (FK gallery), created_at, updated_at
20. `messages`: id, name, email, phone, subject, message, is_read, created_at

## 4. Storage Buckets
- `media`: public bucket for images
- `documents`: private bucket for student documents and study materials
