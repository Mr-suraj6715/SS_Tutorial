import React, { useState, useRef } from 'react'
import { UploadCloud, X, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { uploadOptimizedImage } from '@/lib/utils/image'
import { supabase } from '@/lib/supabase/client'

interface FileUploadProps {
  label?: string
  accept?: string
  bucket?: 'media' | 'documents'
  folder?: string
  currentUrl?: string
  onUploadSuccess: (urls: { url: string; webpUrl?: string; thumbnailUrl?: string }) => void
  onRemove?: () => void
  helperText?: string
  required?: boolean
  isDocument?: boolean
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = 'image/*',
  bucket = 'media',
  folder = 'uploads',
  currentUrl,
  onUploadSuccess,
  onRemove,
  helperText,
  required = false,
  isDocument = false,
}) => {
  const [preview, setPreview] = useState<string>(currentUrl || '')
  const [fileName, setFileName] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError('')
    setIsUploading(true)
    setFileName(file.name)

    try {
      if (!isDocument && file.type.startsWith('image/')) {
        // Instant local preview
        const localPreviewUrl = URL.createObjectURL(file)
        setPreview(localPreviewUrl)

        // Process WebP + Thumbnail and upload
        const result = await uploadOptimizedImage(file, folder)
        setPreview(result.webpUrl || result.imageUrl)
        onUploadSuccess({
          url: result.imageUrl,
          webpUrl: result.webpUrl,
          thumbnailUrl: result.thumbnailUrl,
        })
      } else {
        // Document upload to 'documents' or 'media' bucket
        const fileExt = file.name.split('.').pop()
        const path = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: true })

        if (uploadError) throw uploadError

        let finalUrl = ''
        if (bucket === 'media') {
          const { data } = supabase.storage.from('media').getPublicUrl(path)
          finalUrl = data.publicUrl
        } else {
          // Documents bucket uses signed URLs or path references
          const { data } = await supabase.storage
            .from('documents')
            .createSignedUrl(path, 60 * 60 * 24 * 7) // 7 days
          finalUrl = data?.signedUrl || path
        }

        setPreview(finalUrl)
        onUploadSuccess({ url: finalUrl })
      }
    } catch (err: any) {
      console.error('Upload failed:', err)
      setError(err?.message || 'Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview('')
    setFileName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (onRemove) onRemove()
  }

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group border-2 border-dashed rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[140px] ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
            : preview
            ? 'border-emerald-300 dark:border-emerald-800 bg-slate-50 dark:bg-slate-900/40'
            : 'border-slate-300 hover:border-emerald-400 dark:border-slate-700 dark:hover:border-emerald-500 bg-white dark:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {preview ? (
          <div className="w-full flex flex-col items-center gap-3">
            {!isDocument && (preview.startsWith('http') || preview.startsWith('blob:') || preview.startsWith('data:')) ? (
              <div className="relative w-full max-w-[280px] h-36 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm">
                <img
                  src={preview}
                  alt="Upload preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 w-full max-w-sm">
                <FileText className="w-8 h-8 text-emerald-600 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                    {fileName || 'Document uploaded'}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> File ready
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/50 rounded-lg transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-900/50 rounded-lg transition"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition">
              {isUploading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {isUploading ? 'Optimizing & Uploading...' : 'Click or drag file to upload'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {helperText || (isDocument ? 'PDF, DOCX up to 50MB' : 'PNG, JPG, WebP (auto-optimized)')}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  )
}
