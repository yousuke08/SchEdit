import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import './Canvas.css'
import { GRID_SIZE } from '../utils/grid'

const Canvas = forwardRef(({ showGrid }, ref) => {
  const canvasRef = useRef(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.0)
  const [isPanning, setIsPanning] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getZoom: () => zoom,
    setZoom: (newZoom) => setZoom(Math.max(0.1, Math.min(3.0, newZoom))),
    zoomIn: () => setZoom(prev => Math.min(prev + 0.1, 3.0)),
    zoomOut: () => setZoom(prev => Math.max(prev - 0.1, 0.1)),
    zoomToPoint: (clientX, clientY, delta) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top

      const worldX = (x - pan.x) / zoom
      const worldY = (y - pan.y) / zoom

      const newZoom = Math.max(0.1, Math.min(3.0, zoom * (1 + delta)))

      const newPanX = x - worldX * newZoom
      const newPanY = y - worldY * newZoom

      setZoom(newZoom)
      setPan({ x: newPanX, y: newPanY })
    }
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const rect = canvas.parentElement.getBoundingClientRect()

    canvas.width = rect.width
    canvas.height = rect.height

    // Clear canvas
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Apply transformations
    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 1 / zoom

      const startX = Math.floor(-pan.x / zoom / GRID_SIZE) * GRID_SIZE
      const startY = Math.floor(-pan.y / zoom / GRID_SIZE) * GRID_SIZE
      const endX = Math.ceil((canvas.width - pan.x) / zoom / GRID_SIZE) * GRID_SIZE
      const endY = Math.ceil((canvas.height - pan.y) / zoom / GRID_SIZE) * GRID_SIZE

      // Vertical lines
      for (let x = startX; x <= endX; x += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(x, startY)
        ctx.lineTo(x, endY)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = startY; y <= endY; y += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(startX, y)
        ctx.lineTo(endX, y)
        ctx.stroke()
      }
    }

    ctx.restore()
  }, [showGrid, zoom, pan])

  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) { // Middle button or Shift+Left
      setIsPanning(true)
      setLastMousePos({ x: e.clientX, y: e.clientY })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x
      const dy = e.clientY - lastMousePos.y
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      setLastMousePos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = -e.deltaY * 0.001

    if (ref?.current) {
      ref.current.zoomToPoint(e.clientX, e.clientY, delta)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const preventWheel = (e) => e.preventDefault()
    canvas.addEventListener('wheel', preventWheel, { passive: false })

    return () => {
      canvas.removeEventListener('wheel', preventWheel)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        style={{ cursor: isPanning ? 'grabbing' : 'crosshair' }}
      ></canvas>
    </div>
  )
})

Canvas.displayName = 'Canvas'

export default Canvas
