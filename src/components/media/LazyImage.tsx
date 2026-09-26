import React, { useState } from 'react'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  thumbnailSrc?: string | null
  alt: string
  className?: string
  aspectRatio?: string
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  thumbnailSrc,
  alt,
  className = '',
  aspectRatio,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(thumbnailSrc || src)

  const handleFullImageLoad = () => {
    setIsLoaded(true)
  }

  // If thumbnail exists and is not loaded yet, preload full image in background
  React.useEffect(() => {
    if (thumbnailSrc && thumbnailSrc !== src) {
      const fullImg = new Image()
      fullImg.src = src
      fullImg.onload = () => {
        setCurrentSrc(src)
        setIsLoaded(true)
      }
    }
  }, [src, thumbnailSrc])

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        onLoad={handleFullImageLoad}
        className={`w-full h-full object-cover transition-all duration-500 ${
          !isLoaded && thumbnailSrc ? 'blur-sm scale-105' : 'blur-0 scale-100'
        }`}
        {...props}
      />
    </div>
  )
}
