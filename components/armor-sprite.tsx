'use client'

import { useEffect, useRef } from 'react'
import type { PieceSlot } from '@/lib/types'

const imageCache = new Map<string, Promise<HTMLImageElement>>()

function loadImage(src: string) {
  let p = imageCache.get(src)
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
    imageCache.set(src, p)
  }
  return p
}

export function ArmorSprite({
  piece,
  color,
  size = 64,
  label,
}: {
  piece: PieceSlot
  color: string | null
  size?: number
  label?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false
    const base = piece === 'boots' ? 'boots__base' : `${piece}_base`
    Promise.all([loadImage(`/images/armor/${piece}_tint.png`), loadImage(`/images/armor/${base}.png`)])
      .then(([tint, overlay]) => {
        const canvas = ref.current
        if (cancelled || !canvas) return
        canvas.width = tint.naturalWidth
        canvas.height = tint.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(tint, 0, 0)
        ctx.globalCompositeOperation = 'multiply'
        ctx.fillStyle = color ?? '#A06540'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.globalCompositeOperation = 'destination-in'
        ctx.drawImage(tint, 0, 0)
        ctx.globalCompositeOperation = 'source-over'
        ctx.drawImage(overlay, 0, 0)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [piece, color])

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label ?? `${piece} dyed ${color ?? 'default'}`}
      style={{ width: size, height: size, imageRendering: 'pixelated', objectFit: 'contain' }}
      className="drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]"
    />
  )
}
