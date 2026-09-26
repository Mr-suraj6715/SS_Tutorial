# Roadmap: SS Tutorial Coaching Institute Website

## Phase 1: Foundation & Database Migrations
- [x] Initialize project configuration (`package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`)
- [x] Setup Tailwind CSS v4 design system with Deep Green + Amber palette
- [x] Complete Supabase SQL migration for 19 tables + messages with RLS, `has_role()` security-definer function, grants, and seed data
- [x] Storage buckets definition (`media` & `documents`) with RLS

## Phase 2: Core Architecture & Authentication
- [x] Supabase client setup (browser + TypeScript database types)
- [x] Role-Based Access Control (RBAC) helpers and auth routing (`/auth`, dashboards)
- [x] Site settings state provider and reactive settings hook
- [x] Reusable media upload and image optimization utilities (client WebP + thumbnail generator)
- [x] Global layout: responsive Header with mobile drawer, Footer with prominent Instagram @ss__tutorial, NoticeTicker, WhatsApp floating button

## Phase 3: Public Experience Pages
- [x] Home page with hero, notice ticker, about snippet, featured courses, facilities grid, top results, gallery preview, testimonials, blog preview, Instagram CTA, "Inside classrooms"
- [x] About page with vision/mission, faculty cards, facilities, achievements
- [x] Courses listing with category filtering + Course detail page with syllabus accordion and batch schedules
- [x] Results & achievements showcase page
- [x] Gallery page with masonry layout, category tabs, and modal lightbox (with Instagram post attribution)
- [x] Videos page supporting YouTube + Instagram reel embeds
- [x] Blog listing + dynamic slug detail page with SEO tags
- [x] Contact page with live details, Google Maps embed, WhatsApp action, contact message form
- [x] Online Admission multi-step application form with document upload
- [x] Auth login/signup page with role-based dashboard redirection

## Phase 4: Role-Based Dashboards
- [x] Student Dashboard: profile, attendance records, fees payment status, exam results, batch study materials
- [x] Parent Dashboard: child's attendance, fees, academic results
- [x] Teacher Dashboard: batch schedule, attendance marking, study materials upload, exam results grading
- [x] Admin Dashboard Shell: metrics cards, navigation, profile controls
- [x] Admin CRUD Modules:
  - [x] Admissions Manager (Approve/Reject with feedback)
  - [x] Users & Roles Manager
  - [x] Courses & Batches Manager
  - [x] Fees & Payments Tracker
  - [x] Exams & Results Grading
  - [x] Website CMS (Hero, Blogs, Testimonials, Achievements, Facilities, Faculty)
  - [x] Gallery Manager (Multi-file upload, WebP auto-conversion, caption/alt-text/placement, bulk actions)
  - [x] Video Manager (YouTube + Instagram reels)
  - [x] Instagram Bulk Import (queue tracker, failure retries, status indicators)
  - [x] Messages Inbox
  - [x] Master Settings Editor (Institute details, social links, logo, hero banner, WhatsApp)

## Phase 5: SEO, Optimization & Verification
- [x] Per-page dynamic SEO metadata, OpenGraph tags, JSON-LD schemas
- [x] `robots.txt` configuration
- [x] Build and TypeScript validation (passed with 0 errors)
- [x] Browser visual verification with screenshots captured
