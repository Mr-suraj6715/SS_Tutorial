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
 * Uploads an image with automatic WebP and Thumbnail generation to local server /api/upload
 */
export async function uploadOptimizedImage(
  file: File,
  _folder: string = 'general'
): Promise<{ imageUrl: string; webpUrl: string; thumbnailUrl: string }> {
  try {
    // Process image into WebP and Thumbnail blobs
    const { webpBlob, thumbnailBlob } = await processImageForWeb(file)

    const formData = new FormData()
    // Append original, webp, and thumbnail
    formData.append('files', file, file.name)
    const webpFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
    formData.append('files', webpBlob, webpFileName)
    const thumbFileName = file.name.replace(/\.[^/.]+$/, '') + '_thumb.webp'
    formData.append('files', thumbnailBlob, thumbFileName)

    const token = localStorage.getItem('ss_token')
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = 'Bearer ' + token

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`)
    }

    const data = await res.json()
    const files = data.files || []

    const origUrl = files[0]?.url || data.url
    const webpUrl = files[1]?.url || origUrl
    const thumbUrl = files[2]?.url || webpUrl

    return {
      imageUrl: origUrl,
      webpUrl: webpUrl,
      thumbnailUrl: thumbUrl,
    }
  } catch (err) {
    console.warn('Backend upload error, attempting single file upload fallback:', err)
    
    // Direct single upload fallback
    const singleData = new FormData()
    singleData.append('file', file)
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: singleData,
    })

    if (res.ok) {
      const data = await res.json()
      return {
        imageUrl: data.url,
        webpUrl: data.url,
        thumbnailUrl: data.url,
      }
    }

    throw err
  }
}

