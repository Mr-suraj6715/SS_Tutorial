import { supabase } from '../supabase/client'

export interface ProcessedImages {
  originalFile: File
  webpBlob: Blob
  thumbnailBlob: Blob
}

/**
 * Compresses an image and creates a WebP variant and a thumbnail using the HTML Canvas API
 */
export async function processImageForWeb(file: File): Promise<ProcessedImages> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        try {
          // 1. Generate compressed full WebP (max width/height 1920px)
          const maxDim = 1920
          let width = img.width
          let height = img.height
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('Could not get 2D canvas context')
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (webpBlob) => {
              if (!webpBlob) return reject(new Error('Failed to create WebP blob'))

              // 2. Generate Thumbnail (max width 400px)
              const thumbDim = 400
              let thumbW = img.width
              let thumbH = img.height
              if (thumbW > thumbDim || thumbH > thumbDim) {
                if (thumbW > thumbH) {
                  thumbH = Math.round((thumbH * thumbDim) / thumbW)
                  thumbW = thumbDim
                } else {
                  thumbW = Math.round((thumbW * thumbDim) / thumbH)
                  thumbH = thumbDim
                }
              }

              const thumbCanvas = document.createElement('canvas')
              thumbCanvas.width = thumbW
              thumbCanvas.height = thumbH
              const thumbCtx = thumbCanvas.getContext('2d')
              if (!thumbCtx) return reject(new Error('Could not get thumbnail context'))
              thumbCtx.drawImage(img, 0, 0, thumbW, thumbH)

              thumbCanvas.toBlob(
                (thumbnailBlob) => {
                  if (!thumbnailBlob) return reject(new Error('Failed to create thumbnail blob'))
                  resolve({
                    originalFile: file,
                    webpBlob,
                    thumbnailBlob,
                  })
                },
                'image/webp',
                0.8
              )
            },
            'image/webp',
            0.85
          )
        } catch (err) {
          reject(err)
        }
      }
      img.onerror = () => reject(new Error('Failed to load image file'))
      img.src = event.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Uploads an image with automatic WebP and Thumbnail generation to Supabase 'media' bucket
 */
export async function uploadOptimizedImage(
  file: File,
  folder: string = 'general'
): Promise<{ imageUrl: string; webpUrl: string; thumbnailUrl: string }> {
  const fileExt = file.name.split('.').pop() || 'jpg'
  const baseId = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  // Process image
  const { webpBlob, thumbnailBlob } = await processImageForWeb(file)

  // 1. Upload original
  const origPath = `${baseId}.${fileExt}`
  const { error: origErr } = await supabase.storage.from('media').upload(origPath, file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (origErr) throw origErr

  // 2. Upload WebP variant
  const webpPath = `${baseId}.webp`
  const { error: webpErr } = await supabase.storage.from('media').upload(webpPath, webpBlob, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: true,
  })
  if (webpErr) throw webpErr

  // 3. Upload Thumbnail
  const thumbPath = `${baseId}_thumb.webp`
  const { error: thumbErr } = await supabase.storage.from('media').upload(thumbPath, thumbnailBlob, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: true,
  })
  if (thumbErr) throw thumbErr

  const { data: origData } = supabase.storage.from('media').getPublicUrl(origPath)
  const { data: webpData } = supabase.storage.from('media').getPublicUrl(webpPath)
  const { data: thumbData } = supabase.storage.from('media').getPublicUrl(thumbPath)

  return {
    imageUrl: origData.publicUrl,
    webpUrl: webpData.publicUrl,
    thumbnailUrl: thumbData.publicUrl,
  }
}
