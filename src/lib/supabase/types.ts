export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string
          avatar_url: string | null
          role: 'student' | 'parent' | 'teacher' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string
          phone?: string
          avatar_url?: string | null
          role?: 'student' | 'parent' | 'teacher' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          avatar_url?: string | null
          role?: 'student' | 'parent' | 'teacher' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'moderator' | 'user'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: 'admin' | 'moderator' | 'user'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'moderator' | 'user'
          created_at?: string
        }
      }
      site_settings: {
        Row: {
          key: string
          value: string
          description: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value?: string
          description?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string
          description?: string | null
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          syllabus: string
          duration: string
          fee: string
          category: string
          image_url: string
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string
          slug: string
          description?: string
          syllabus?: string
          duration?: string
          fee?: string
          category?: string
          image_url?: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          syllabus?: string
          duration?: string
          fee?: string
          category?: string
          image_url?: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      batches: {
        Row: {
          id: string
          course_id: string
          name: string
          schedule: string
          start_date: string | null
          end_date: string | null
          capacity: number
          teacher_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          name?: string
          schedule?: string
          start_date?: string | null
          end_date?: string | null
          capacity?: number
          teacher_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          name?: string
          schedule?: string
          start_date?: string | null
          end_date?: string | null
          capacity?: number
          teacher_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admissions: {
        Row: {
          id: string
          student_name: string
          parent_name: string
          phone: string
          email: string
          address: string
          course_id: string | null
          batch_id: string | null
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          documents: string[]
          applied_at: string
          reviewed_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          student_name?: string
          parent_name?: string
          phone?: string
          email?: string
          address?: string
          course_id?: string | null
          batch_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          documents?: string[]
          applied_at?: string
          reviewed_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          student_name?: string
          parent_name?: string
          phone?: string
          email?: string
          address?: string
          course_id?: string | null
          batch_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          documents?: string[]
          applied_at?: string
          reviewed_by?: string | null
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          batch_id: string
          date: string
          status: 'present' | 'absent' | 'late'
          marked_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          batch_id: string
          date?: string
          status?: 'present' | 'absent' | 'late'
          marked_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          batch_id?: string
          date?: string
          status?: 'present' | 'absent' | 'late'
          marked_by?: string | null
          created_at?: string
        }
      }
      fees: {
        Row: {
          id: string
          student_id: string
          batch_id: string
          amount: number
          paid_amount: number
          due_date: string | null
          status: 'paid' | 'partial' | 'unpaid'
          payment_date: string | null
          method: string | null
          remarks: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          batch_id: string
          amount?: number
          paid_amount?: number
          due_date?: string | null
          status?: 'paid' | 'partial' | 'unpaid'
          payment_date?: string | null
          method?: string | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          batch_id?: string
          amount?: number
          paid_amount?: number
          due_date?: string | null
          status?: 'paid' | 'partial' | 'unpaid'
          payment_date?: string | null
          method?: string | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          batch_id: string
          title: string
          date: string
          total_marks: number
          passing_marks: number
          created_at: string
        }
        Insert: {
          id?: string
          batch_id: string
          title?: string
          date?: string
          total_marks?: number
          passing_marks?: number
          created_at?: string
        }
        Update: {
          id?: string
          batch_id?: string
          title?: string
          date?: string
          total_marks?: number
          passing_marks?: number
          created_at?: string
        }
      }
      results: {
        Row: {
          id: string
          exam_id: string
          student_id: string
          marks_obtained: number
          grade: string | null
          remarks: string | null
          created_at: string
        }
        Insert: {
          id?: string
          exam_id: string
          student_id: string
          marks_obtained?: number
          grade?: string | null
          remarks?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          exam_id?: string
          student_id?: string
          marks_obtained?: number
          grade?: string | null
          remarks?: string | null
          created_at?: string
        }
      }
      study_materials: {
        Row: {
          id: string
          batch_id: string
          title: string
          description: string | null
          file_url: string
          file_type: string | null
          uploaded_by: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          batch_id: string
          title?: string
          description?: string | null
          file_url?: string
          file_type?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          batch_id?: string
          title?: string
          description?: string | null
          file_url?: string
          file_type?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
        }
      }
      blogs: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string
          content: string
          cover_url: string
          author: string
          published_at: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string
          slug: string
          excerpt?: string
          content?: string
          cover_url?: string
          author?: string
          published_at?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string
          content?: string
          cover_url?: string
          author?: string
          published_at?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      gallery: {
        Row: {
          id: string
          title: string
          caption: string
          alt_text: string
          image_url: string
          thumbnail_url: string | null
          webp_url: string | null
          placement: 'gallery' | 'hero' | 'classroom' | 'results'
          display_order: number
          instagram_post_url: string | null
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title?: string
          caption?: string
          alt_text?: string
          image_url?: string
          thumbnail_url?: string | null
          webp_url?: string | null
          placement?: 'gallery' | 'hero' | 'classroom' | 'results'
          display_order?: number
          instagram_post_url?: string | null
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          caption?: string
          alt_text?: string
          image_url?: string
          thumbnail_url?: string | null
          webp_url?: string | null
          placement?: 'gallery' | 'hero' | 'classroom' | 'results'
          display_order?: number
          instagram_post_url?: string | null
          is_published?: boolean
          created_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          description: string | null
          url: string
          platform: 'youtube' | 'instagram'
          embed_url: string
          thumbnail: string | null
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title?: string
          description?: string | null
          url?: string
          platform?: 'youtube' | 'instagram'
          embed_url?: string
          thumbnail?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          url?: string
          platform?: 'youtube' | 'instagram'
          embed_url?: string
          thumbnail?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          student_name: string
          course: string
          text: string
          rating: number
          photo_url: string | null
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          student_name?: string
          course?: string
          text?: string
          rating?: number
          photo_url?: string | null
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          student_name?: string
          course?: string
          text?: string
          rating?: number
          photo_url?: string | null
          is_published?: boolean
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string
          date: string | null
          category: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          title?: string
          description?: string
          image_url?: string
          date?: string | null
          category?: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string
          date?: string | null
          category?: string
          display_order?: number
          created_at?: string
        }
      }
      facilities: {
        Row: {
          id: string
          title: string
          description: string
          icon: string
          image_url: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          title?: string
          description?: string
          icon?: string
          image_url?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon?: string
          image_url?: string | null
          display_order?: number
          created_at?: string
        }
      }
      faculty: {
        Row: {
          id: string
          name: string
          designation: string
          bio: string
          photo_url: string | null
          subjects: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name?: string
          designation?: string
          bio?: string
          photo_url?: string | null
          subjects?: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          designation?: string
          bio?: string
          photo_url?: string | null
          subjects?: string
          display_order?: number
          created_at?: string
        }
      }
      instagram_imports: {
        Row: {
          id: string
          url: string
          status: 'queued' | 'processing' | 'completed' | 'failed'
          attempts: number
          failure_reason: string | null
          gallery_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          url: string
          status?: 'queued' | 'processing' | 'completed' | 'failed'
          attempts?: number
          failure_reason?: string | null
          gallery_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          url?: string
          status?: 'queued' | 'processing' | 'completed' | 'failed'
          attempts?: number
          failure_reason?: string | null
          gallery_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          subject: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          subject?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          subject?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
  }
}
