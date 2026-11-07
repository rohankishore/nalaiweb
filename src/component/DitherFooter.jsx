import { useEffect, useRef } from 'react'

const RIDGES = [
  { color: '#dce9f4', y: 0.3, amplitude: 0.13, scale: 1.1, offset: 0 },
  { color: '#b8d2ea', y: 0.4, amplitude: 0.16, scale: 1.3, offset: 0.5 },
  { color: '#86afd4', y: 0.53, amplitude: 0.2, scale: 1.7, offset: 1.2 },
  { color: '#527fac', y: 0.67, amplitude: 0.25, scale: 2, offset: 2.1 },
  { color: '#244c7d', y: 0.79, amplitude: 0.3, scale: 2.5, offset: 3.4 },
]

function ridgeY(x, ridge, time, parallax) {
  const wave = Math.sin(x * ridge.scale * 7 + ridge.offset + time * 0.12) * ridge.amplitude
  const detail = Math.sin(x * ridge.scale * 17 + ridge.offset * 2) * ridge.amplitude * 0.28
  return ridge.y - wave - detail - parallax * (1 - ridge.y)
}

export default function DitherFooter() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const context = canvas.getContext('2d')
    if (!context) return undefined

    let frame = 0
    let pointer = 0
    let targetPointer = 0
    let scroll = 0
    let targetScroll = 0
    let visible = false
    const renderScale = 0.42
    const dot = 2
    const bayer = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ]

    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * renderScale))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * renderScale))
      context.setTransform(1, 0, 0, 1, 0, 0)
    }

    const onPointerMove = (event) => {
      const bounds = canvas.getBoundingClientRect()
      targetPointer = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
    }
    const onScroll = () => {
      const bounds = canvas.getBoundingClientRect()
      targetScroll = Math.max(-1, Math.min(1, -bounds.top / Math.max(bounds.height, 1)))
    }

    const draw = (time) => {
      if (!visible) {
        frame = 0
        return
      }
      const width = canvas.width
      const height = canvas.height
      pointer += (targetPointer - pointer) * 0.06
      scroll += (targetScroll - scroll) * 0.04
      context.clearRect(0, 0, width, height)

      for (let r = 0; r < RIDGES.length; r += 1) {
        const ridge = RIDGES[r]
        context.fillStyle = ridge.color
        const step = dot
        for (let y = 0; y < height; y += step) {
          for (let x = 0; x < width; x += step) {
            const nx = x / width
            const edge = ridgeY(nx, ridge, time * 0.001, pointer * 0.025 + scroll * 0.08)
            const normalizedY = y / height
            if (normalizedY < edge) continue
            const depth = Math.min(1, (normalizedY - edge) / Math.max(0.08, 1 - edge))
            const texture = (Math.sin(x * 0.08 + r * 8) + Math.sin(y * 0.13 + x * 0.02) + 2) / 4
            const threshold = bayer[(y / step) % 4][(x / step) % 4] / 16
            if (texture * (0.78 + depth * 0.42) > threshold) context.fillRect(x, y, step, step)
          }
        }
      }

      frame = requestAnimationFrame(draw)
    }

    resize()
    onScroll()
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !frame) frame = requestAnimationFrame(draw)
    }, { threshold: 0.01 })
    observer.observe(canvas)
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })
    canvas.addEventListener('pointermove', onPointerMove)
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      canvas.removeEventListener('pointermove', onPointerMove)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="dither-footer-canvas" aria-hidden="true" />
}
