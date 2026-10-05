import React, { useCallback, useEffect, useRef, useState } from 'react'
import { X, RotateCcw, RotateCw, ZoomIn, ZoomOut, Crop, RefreshCw, Check, Maximize2 } from 'lucide-react'

interface ImageCropperModalProps {
  /** Blob URL or data URL of the image to crop */
  src: string
  /** Original File object (used to get the filename) */
  originalFile: File
  onConfirm: (croppedBlob: Blob, croppedFile: File) => void
  onCancel: () => void
}

const ASPECT_RATIOS: { label: string; value: number | null }[] = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: '2:3', value: 2 / 3 },
]

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  src,
  originalFile,
  onConfirm,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const [imageLoaded, setImageLoaded] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cropNorm, setCropNorm] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 })

  const dragState = useRef<{
    type: string | null
    startX: number
    startY: number
    startCrop: { x: number; y: number; w: number; h: number }
    startPan: { x: number; y: number }
  }>({ type: null, startX: 0, startY: 0, startCrop: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 }, startPan: { x: 0, y: 0 } })

  const CANVAS_W = 680
  const CANVAS_H = 440

  const getHandlePositions = (cx: number, cy: number, cw: number, ch: number): [number, number][] => [
    [cx, cy], [cx + cw / 2, cy], [cx + cw, cy],
    [cx + cw, cy + ch / 2], [cx + cw, cy + ch],
    [cx + cw / 2, cy + ch], [cx, cy + ch], [cx, cy + ch / 2],
  ]

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !imageLoaded) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    ctx.save()
    ctx.translate(CANVAS_W / 2 + panOffset.x, CANVAS_H / 2 + panOffset.y)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(zoom, zoom)
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2, img.naturalWidth, img.naturalHeight)
    ctx.restore()

    const cx = cropNorm.x * CANVAS_W
    const cy = cropNorm.y * CANVAS_H
    const cw = cropNorm.w * CANVAS_W
    const ch = cropNorm.h * CANVAS_H

    ctx.fillStyle = 'rgba(0,0,0,0.52)'
    ctx.fillRect(0, 0, CANVAS_W, cy)
    ctx.fillRect(0, cy + ch, CANVAS_W, CANVAS_H - cy - ch)
    ctx.fillRect(0, cy, cx, ch)
    ctx.fillRect(cx + cw, cy, CANVAS_W - cx - cw, ch)

    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.strokeRect(cx, cy, cw, ch)

    ctx.strokeStyle = 'rgba(245,158,11,0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cx + cw / 3, cy); ctx.lineTo(cx + cw / 3, cy + ch)
    ctx.moveTo(cx + (2 * cw) / 3, cy); ctx.lineTo(cx + (2 * cw) / 3, cy + ch)
    ctx.moveTo(cx, cy + ch / 3); ctx.lineTo(cx + cw, cy + ch / 3)
    ctx.moveTo(cx, cy + (2 * ch) / 3); ctx.lineTo(cx + cw, cy + (2 * ch) / 3)
    ctx.stroke()

    getHandlePositions(cx, cy, cw, ch).forEach(([hx, hy]) => {
      ctx.fillStyle = '#f59e0b'
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(hx, hy, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    })
  }, [imageLoaded, zoom, rotation, panOffset, cropNorm])

  useEffect(() => { draw() }, [draw])

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      const scaleW = (CANVAS_W * 0.85) / img.naturalWidth
      const scaleH = (CANVAS_H * 0.85) / img.naturalHeight
      setZoom(Math.min(scaleW, scaleH))
      setImageLoaded(true)
    }
    img.src = src
  }, [src])

  const getCanvasXY = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (CANVAS_W / rect.width),
      y: (e.clientY - rect.top) * (CANVAS_H / rect.height),
    }
  }

  const detectHit = (mx: number, my: number): string => {
    const cx = cropNorm.x * CANVAS_W
    const cy = cropNorm.y * CANVAS_H
    const cw = cropNorm.w * CANVAS_W
    const ch = cropNorm.h * CANVAS_H
    const labels = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
    const positions = getHandlePositions(cx, cy, cw, ch)
    for (let i = 0; i < positions.length; i++) {
      const dx = mx - positions[i][0]; const dy = my - positions[i][1]
      if (Math.sqrt(dx * dx + dy * dy) < 10) return labels[i]
    }
    if (mx > cx && mx < cx + cw && my > cy && my < cy + ch) return 'move'
    return 'pan'
  }

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const { x, y } = getCanvasXY(e)
    dragState.current = {
      type: detectHit(x, y),
      startX: x, startY: y,
      startCrop: { ...cropNorm },
      startPan: { ...panOffset },
    }
  }

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasXY(e)
    // Update cursor
    if (canvasRef.current) {
      const cursorMap: Record<string, string> = {
        nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize',
        n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize',
        move: 'move', pan: 'grab',
      }
      canvasRef.current.style.cursor = cursorMap[detectHit(x, y)] || 'default'
    }

    if (!dragState.current.type) return
    const dx = (x - dragState.current.startX) / CANVAS_W
    const dy = (y - dragState.current.startY) / CANVAS_H
    const sc = dragState.current.startCrop
    const type = dragState.current.type

    if (type === 'pan') {
      setPanOffset({
        x: dragState.current.startPan.x + (x - dragState.current.startX),
        y: dragState.current.startPan.y + (y - dragState.current.startY),
      })
      return
    }

    const MIN = 0.05
    let { x: nx, y: ny, w: nw, h: nh } = sc

    if (type === 'move') {
      nx = Math.max(0, Math.min(1 - sc.w, sc.x + dx))
      ny = Math.max(0, Math.min(1 - sc.h, sc.y + dy))
    } else {
      if (type.includes('w')) {
        const newX = Math.max(0, Math.min(sc.x + sc.w - MIN, sc.x + dx))
        nw = sc.w + (sc.x - newX); nx = newX
      }
      if (type.includes('e')) nw = Math.max(MIN, Math.min(1 - sc.x, sc.w + dx))
      if (type.includes('n')) {
        const newY = Math.max(0, Math.min(sc.y + sc.h - MIN, sc.y + dy))
        nh = sc.h + (sc.y - newY); ny = newY
      }
      if (type.includes('s')) nh = Math.max(MIN, Math.min(1 - sc.y, sc.h + dy))
    }

    if (selectedRatio !== null && type !== 'move') {
      const targetAspect = selectedRatio / (CANVAS_W / CANVAS_H)
      if (type.includes('e') || type.includes('w')) nh = nw / targetAspect
      else nw = nh * targetAspect
      if (nx + nw > 1) nw = 1 - nx
      if (ny + nh > 1) nh = 1 - ny
    }

    setCropNorm({ x: nx, y: ny, w: nw, h: nh })
  }

  const onMouseUp = () => { dragState.current.type = null }
  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setZoom(z => Math.max(0.1, Math.min(10, z - e.deltaY * 0.001)))
  }

  const applyAspectRatio = (ratio: number | null) => {
    setSelectedRatio(ratio)
    if (ratio === null) return
    const targetNorm = ratio / (CANVAS_W / CANVAS_H)
    const newH = Math.min(cropNorm.w / targetNorm, 1 - cropNorm.y)
    const newW = Math.min(newH * targetNorm, 1 - cropNorm.x)
    setCropNorm({ x: cropNorm.x, y: cropNorm.y, w: newW, h: newH })
  }

  const resetCrop = () => {
    setCropNorm({ x: 0.05, y: 0.05, w: 0.9, h: 0.9 })
    const img = imgRef.current
    if (img) setZoom(Math.min((CANVAS_W * 0.85) / img.naturalWidth, (CANVAS_H * 0.85) / img.naturalHeight))
    setPanOffset({ x: 0, y: 0 })
    setRotation(0)
  }

  const handleConfirm = async () => {
    const img = imgRef.current
    if (!img) return
    setIsProcessing(true)
    try {
      const rad = (rotation * Math.PI) / 180
      const cosR = Math.abs(Math.cos(rad))
      const sinR = Math.abs(Math.sin(rad))

      // Render the rotated full image
      const rotCanvas = document.createElement('canvas')
      rotCanvas.width = Math.ceil(img.naturalWidth * cosR + img.naturalHeight * sinR)
      rotCanvas.height = Math.ceil(img.naturalWidth * sinR + img.naturalHeight * cosR)
      const rotCtx = rotCanvas.getContext('2d')!
      rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2)
      rotCtx.rotate(rad)
      rotCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)

      const imgCX = CANVAS_W / 2 + panOffset.x
      const imgCY = CANVAS_H / 2 + panOffset.y
      const cropCX = cropNorm.x * CANVAS_W
      const cropCY = cropNorm.y * CANVAS_H
      const cropCW = cropNorm.w * CANVAS_W
      const cropCH = cropNorm.h * CANVAS_H

      const rotCenterX = rotCanvas.width / 2
      const rotCenterY = rotCanvas.height / 2

      const rotCorners = [
        [cropCX, cropCY], [cropCX + cropCW, cropCY],
        [cropCX, cropCY + cropCH], [cropCX + cropCW, cropCY + cropCH],
      ].map(([px, py]) => {
        const tx = (px - imgCX) / zoom
        const ty = (py - imgCY) / zoom
        return [tx * Math.cos(rad) - ty * Math.sin(rad) + rotCenterX,
                tx * Math.sin(rad) + ty * Math.cos(rad) + rotCenterY]
      })

      const rMinX = Math.max(0, Math.floor(Math.min(...rotCorners.map(c => c[0]))))
      const rMaxX = Math.min(rotCanvas.width, Math.ceil(Math.max(...rotCorners.map(c => c[0]))))
      const rMinY = Math.max(0, Math.floor(Math.min(...rotCorners.map(c => c[1]))))
      const rMaxY = Math.min(rotCanvas.height, Math.ceil(Math.max(...rotCorners.map(c => c[1]))))

      const rW = rMaxX - rMinX
      const rH = rMaxY - rMinY

      if (rW <= 0 || rH <= 0) {
        alert('Invalid crop area. Please adjust and try again.')
        setIsProcessing(false)
        return
      }

      const offCanvas = document.createElement('canvas')
      offCanvas.width = rW
      offCanvas.height = rH
      const offCtx = offCanvas.getContext('2d')!
      offCtx.drawImage(rotCanvas, rMinX, rMinY, rW, rH, 0, 0, rW, rH)

      offCanvas.toBlob(blob => {
        if (!blob) { alert('Failed to export.'); setIsProcessing(false); return }
        const croppedFile = new File([blob], `cropped_${originalFile.name}`, { type: 'image/jpeg' })
        onConfirm(blob, croppedFile)
      }, 'image/jpeg', 0.92)
    } catch (err) {
      console.error('Crop error:', err)
      alert('Cropping failed.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-4xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Crop className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Crop Image</h2>
              <p className="text-xs text-slate-400 truncate max-w-xs">{originalFile.name}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas */}
        <div className="relative bg-slate-950 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="max-w-full select-none"
            style={{ maxHeight: '55vh' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onWheel={onWheel}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-t border-slate-800 space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-slate-400 mr-1">Aspect:</span>
            {ASPECT_RATIOS.map(({ label, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => applyAspectRatio(value)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                  selectedRatio === value
                    ? 'bg-amber-500 text-slate-900 border-amber-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="Zoom Out">
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-mono text-amber-400 min-w-[52px] text-center">
                {(zoom * 100).toFixed(0)}%
              </div>
              <button type="button" onClick={() => setZoom(z => Math.min(10, z + 0.1))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="Zoom In">
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setRotation(r => r - 90)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="Rotate CCW">
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-mono text-amber-400 min-w-[44px] text-center">
                {((rotation % 360) + 360) % 360}°
              </div>
              <button type="button" onClick={() => setRotation(r => r + 90)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="Rotate CW">
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <button type="button" onClick={resetCrop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition">
              <Maximize2 className="w-3.5 h-3.5" /> Reset
            </button>
            <div className="ml-auto flex gap-3">
              <button type="button" onClick={onCancel}
                className="px-5 py-2 rounded-xl font-bold text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 transition">
                Skip (Upload As-Is)
              </button>
              <button type="button" onClick={handleConfirm} disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm text-slate-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 transition shadow-lg">
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isProcessing ? 'Processing…' : 'Apply & Upload'}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            💡 <strong className="text-slate-400">Tip:</strong> Drag handles to crop · Scroll to zoom · Drag outside crop rect to pan the image
          </p>
        </div>
      </div>
    </div>
  )
}
