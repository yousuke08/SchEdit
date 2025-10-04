import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import './Canvas.css'
import { GRID_SIZE, snapToGrid, screenToWorld } from '../utils/grid'
import useSchematicStore from '../store/schematicStore'
import { distanceToLineSegment } from '../utils/geometry'
import { shouldCreateWire } from '../utils/wireUtils'
import { getComponentByType } from './componentLibrary'

const Canvas = forwardRef(({ showGrid }, ref) => {
  const canvasRef = useRef(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.0)
  const [isPanning, setIsPanning] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [drawingWire, setDrawingWire] = useState(null)
  const [currentMousePos, setCurrentMousePos] = useState(null)
  const [draggingComponent, setDraggingComponent] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const {
    wires,
    addWire,
    selectedWireId,
    setSelectedWire,
    removeWire,
    wireColor,
    wireThickness,
    components,
    addComponent,
    selectedComponentId,
    setSelectedComponent,
    removeComponent,
    updateComponent
  } = useSchematicStore()

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

    // Draw wires
    wires.forEach(wire => {
      ctx.strokeStyle = wire.id === selectedWireId ? '#ffff00' : wire.color
      ctx.lineWidth = wire.thickness / zoom
      ctx.lineCap = 'round'

      ctx.beginPath()
      ctx.moveTo(wire.start.x, wire.start.y)
      ctx.lineTo(wire.end.x, wire.end.y)
      ctx.stroke()

      // Draw endpoints
      if (wire.id === selectedWireId) {
        ctx.fillStyle = '#ffff00'
        const pointRadius = 4 / zoom
        ctx.beginPath()
        ctx.arc(wire.start.x, wire.start.y, pointRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(wire.end.x, wire.end.y, pointRadius, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // Draw components
    components.forEach(comp => {
      ctx.save()
      ctx.translate(comp.x, comp.y)
      ctx.rotate(comp.rotation || 0)

      const componentDef = getComponentByType(comp.type)
      if (componentDef) {
        componentDef.render(ctx, comp.id === selectedComponentId)
      }

      ctx.restore()
    })

    // Draw wire being drawn
    if (drawingWire && currentMousePos) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const worldPos = screenToWorld({
        x: currentMousePos.x - rect.left,
        y: currentMousePos.y - rect.top
      }, pan, zoom)
      const snappedPos = { x: snapToGrid(worldPos.x), y: snapToGrid(worldPos.y) }

      ctx.strokeStyle = wireColor
      ctx.lineWidth = wireThickness / zoom
      ctx.lineCap = 'round'
      ctx.setLineDash([5 / zoom, 5 / zoom])

      ctx.beginPath()
      ctx.moveTo(drawingWire.x, drawingWire.y)
      ctx.lineTo(snappedPos.x, snappedPos.y)
      ctx.stroke()

      ctx.setLineDash([])
    }

    ctx.restore()
  }, [showGrid, zoom, pan, wires, selectedWireId, drawingWire, currentMousePos, wireColor, wireThickness, components, selectedComponentId])

  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) { // Middle button or Shift+Left
      setIsPanning(true)
      setLastMousePos({ x: e.clientX, y: e.clientY })
      e.preventDefault()
      return
    }

    if (e.button === 0 && !e.shiftKey) { // Left click for wire drawing
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const worldPos = screenToWorld({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }, pan, zoom)
      const snappedPos = { x: snapToGrid(worldPos.x), y: snapToGrid(worldPos.y) }

      if (!drawingWire) {
        // Check if clicking on a component first
        let clickedComponent = null
        for (const comp of [...components].reverse()) { // Reverse to check top components first
          const componentDef = getComponentByType(comp.type)
          if (!componentDef) continue

          const dx = worldPos.x - comp.x
          const dy = worldPos.y - comp.y

          // Rotate point back to component's local space
          const angle = -(comp.rotation || 0)
          const localX = dx * Math.cos(angle) - dy * Math.sin(angle)
          const localY = dx * Math.sin(angle) + dy * Math.cos(angle)

          // Check if click is within component bounds
          const halfWidth = componentDef.width / 2
          const halfHeight = componentDef.height / 2
          if (Math.abs(localX) <= halfWidth && Math.abs(localY) <= halfHeight) {
            clickedComponent = comp
            break
          }
        }

        if (clickedComponent) {
          // Select and start dragging component
          setSelectedComponent(clickedComponent.id)
          setDraggingComponent(clickedComponent.id)
          setDragOffset({
            x: worldPos.x - clickedComponent.x,
            y: worldPos.y - clickedComponent.y
          })
          return
        }

        // Check if clicking near a grid point (snapped position)
        const gridThreshold = GRID_SIZE / 5
        const distToGrid = Math.sqrt(
          Math.pow(worldPos.x - snappedPos.x, 2) +
          Math.pow(worldPos.y - snappedPos.y, 2)
        )

        if (distToGrid < gridThreshold) {
          // Clicking on/near a grid point - start drawing wire
          setSelectedWire(null)
          setSelectedComponent(null)
          setDrawingWire(snappedPos)
        } else {
          // Check if clicking on wire line
          const clickThreshold = 10 / zoom
          let clickedWire = null
          for (const wire of wires) {
            const distance = distanceToLineSegment(worldPos, wire.start, wire.end)
            if (distance < clickThreshold) {
              clickedWire = wire
              break
            }
          }

          if (clickedWire) {
            // Select wire
            setSelectedWire(clickedWire.id)
            setSelectedComponent(null)
          } else {
            // Start drawing wire
            setSelectedWire(null)
            setSelectedComponent(null)
            setDrawingWire(snappedPos)
          }
        }
      } else {
        // Finish drawing wire
        // Check if start and end points are different
        if (drawingWire.x !== snappedPos.x || drawingWire.y !== snappedPos.y) {
          // Check if wire overlaps with existing wires
          if (shouldCreateWire(drawingWire, snappedPos, wires)) {
            addWire({
              start: drawingWire,
              end: snappedPos,
              color: wireColor,
              thickness: wireThickness
            })
          }
        }
        setDrawingWire(null)
        setCurrentMousePos(null)
      }
    }
  }

  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x
      const dy = e.clientY - lastMousePos.y
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      setLastMousePos({ x: e.clientX, y: e.clientY })
    }

    if (drawingWire) {
      setCurrentMousePos({ x: e.clientX, y: e.clientY })
    }

    if (draggingComponent) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const worldPos = screenToWorld({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }, pan, zoom)

      const newX = worldPos.x - dragOffset.x
      const newY = worldPos.y - dragOffset.y
      const snappedPos = { x: snapToGrid(newX), y: snapToGrid(newY) }

      updateComponent(draggingComponent, {
        x: snappedPos.x,
        y: snappedPos.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    setDraggingComponent(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setDrawingWire(null)
      setCurrentMousePos(null)
      setSelectedWire(null)
      setSelectedComponent(null)
    } else if (e.key === 'Delete') {
      if (selectedWireId) {
        removeWire(selectedWireId)
      } else if (selectedComponentId) {
        removeComponent(selectedComponentId)
      }
    } else if (e.key === 'r' || e.key === 'R') {
      if (selectedComponentId) {
        const component = components.find(c => c.id === selectedComponentId)
        if (component) {
          const currentRotation = component.rotation || 0
          updateComponent(selectedComponentId, {
            rotation: currentRotation + Math.PI / 2
          })
        }
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const componentType = e.dataTransfer.getData('componentType')
    if (!componentType) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const worldPos = screenToWorld({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }, pan, zoom)
    const snappedPos = { x: snapToGrid(worldPos.x), y: snapToGrid(worldPos.y) }

    addComponent({
      type: componentType,
      x: snappedPos.x,
      y: snappedPos.y,
      rotation: 0
    })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedWireId, selectedComponentId, drawingWire, components])

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
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{ cursor: isPanning ? 'grabbing' : 'crosshair' }}
      ></canvas>
    </div>
  )
})

Canvas.displayName = 'Canvas'

export default Canvas
