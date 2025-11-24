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
  const [selectionBox, setSelectionBox] = useState(null)
  const [isMouseDownInSelectMode, setIsMouseDownInSelectMode] = useState(false)
  const [draggingSelection, setDraggingSelection] = useState(false)
  const [selectionDragStart, setSelectionDragStart] = useState(null)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [lastClickPos, setLastClickPos] = useState(null)
  const [draggingWireEnd, setDraggingWireEnd] = useState(null) // { wireId, endpoint: 'start' | 'end' }

  const {
    wires,
    addWire,
    selectedWireId,
    setSelectedWire,
    removeWire,
    updateWire,
    updateWireWithoutHistory,
    wireColor,
    wireThickness,
    wireStyle,
    components,
    addComponent,
    selectedComponentId,
    setSelectedComponent,
    removeComponent,
    updateComponent,
    updateComponentWithoutHistory,
    selectedWireIds,
    selectedComponentIds,
    setMultipleSelection,
    clearSelection,
    copyToClipboard,
    pasteFromClipboard,
    saveToHistory
  } = useSchematicStore()

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getZoom: () => zoom,
    setZoom: (newZoom) => setZoom(Math.max(0.1, Math.min(3.0, newZoom))),
    zoomIn: () => setZoom(prev => Math.min(prev + 0.1, 3.0)),
    zoomOut: () => setZoom(prev => Math.max(prev - 0.1, 0.1)),
    getCanvas: () => canvasRef.current,
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
      const isSelected = wire.id === selectedWireId || selectedWireIds.includes(wire.id)
      ctx.strokeStyle = isSelected ? '#ffff00' : wire.color
      ctx.lineWidth = wire.thickness
      ctx.lineCap = 'round'
      const wireStyle = wire.style || 'solid'

      const drawWireWithStyle = (start, end, style) => {
        const dx = end.x - start.x
        const dy = end.y - start.y
        const length = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx)

        ctx.save()
        ctx.translate(start.x, start.y)
        ctx.rotate(angle)

        switch (style) {
          case 'solid':
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(length, 0)
            ctx.stroke()
            break

          case 'double':
            const offset = wire.thickness * 1
            ctx.beginPath()
            ctx.moveTo(0, -offset)
            ctx.lineTo(length, -offset)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(0, offset)
            ctx.lineTo(length, offset)
            ctx.stroke()
            break

          case 'dashed':
            ctx.setLineDash([10, 5])
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(length, 0)
            ctx.stroke()
            ctx.setLineDash([])
            break

          case 'dash-dot':
            ctx.setLineDash([15, 5, 3, 5])
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(length, 0)
            ctx.stroke()
            ctx.setLineDash([])
            break

          case 'wavy':
            ctx.beginPath()
            const waveLength = 15
            const waveHeight = 4
            const steps = Math.ceil(length / (waveLength / 4))
            for (let i = 0; i <= steps; i++) {
              const x = (i / steps) * length
              const y = Math.sin((i / steps) * (length / waveLength) * Math.PI * 2) * waveHeight
              if (i === 0) {
                ctx.moveTo(x, y)
              } else {
                ctx.lineTo(x, y)
              }
            }
            ctx.stroke()
            break

          case 'double-wavy':
            const waveOffset = wire.thickness * 1
            const waveLen = 15
            const waveHt = 4
            const stepsDouble = Math.ceil(length / (waveLen / 4))

            ctx.beginPath()
            for (let i = 0; i <= stepsDouble; i++) {
              const x = (i / stepsDouble) * length
              const y = Math.sin((i / stepsDouble) * (length / waveLen) * Math.PI * 2) * waveHt - waveOffset
              if (i === 0) {
                ctx.moveTo(x, y)
              } else {
                ctx.lineTo(x, y)
              }
            }
            ctx.stroke()

            ctx.beginPath()
            for (let i = 0; i <= stepsDouble; i++) {
              const x = (i / stepsDouble) * length
              const y = Math.sin((i / stepsDouble) * (length / waveLen) * Math.PI * 2) * waveHt + waveOffset
              if (i === 0) {
                ctx.moveTo(x, y)
              } else {
                ctx.lineTo(x, y)
              }
            }
            ctx.stroke()
            break
        }

        ctx.restore()
      }

      drawWireWithStyle(wire.start, wire.end, wireStyle)

      // Draw endpoints
      if (isSelected) {
        ctx.fillStyle = '#ffff00'
        const pointRadius = 4
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

      // Apply flip transformations
      const scaleX = comp.flipX ? -1 : 1
      const scaleY = comp.flipY ? -1 : 1
      ctx.scale(scaleX, scaleY)

      const componentDef = getComponentByType(comp.type)
      if (componentDef) {
        const isSelected = comp.id === selectedComponentId || selectedComponentIds.includes(comp.id)
        componentDef.render(ctx, isSelected)
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
      ctx.lineWidth = wireThickness
      ctx.lineCap = 'round'
      ctx.setLineDash([5, 5])

      ctx.beginPath()
      ctx.moveTo(drawingWire.x, drawingWire.y)
      ctx.lineTo(snappedPos.x, snappedPos.y)
      ctx.stroke()

      ctx.setLineDash([])
    }

    // Draw selection box
    if (selectionBox) {
      const { start, end } = selectionBox
      ctx.strokeStyle = '#4a9eff'
      ctx.fillStyle = 'rgba(74, 158, 255, 0.1)'
      ctx.lineWidth = 2 / zoom

      const x = Math.min(start.x, end.x)
      const y = Math.min(start.y, end.y)
      const width = Math.abs(end.x - start.x)
      const height = Math.abs(end.y - start.y)

      ctx.fillRect(x, y, width, height)
      ctx.strokeRect(x, y, width, height)
    }

    ctx.restore()
  }, [showGrid, zoom, pan, wires, selectedWireId, drawingWire, currentMousePos, wireColor, wireThickness, components, selectedComponentId, selectedWireIds, selectedComponentIds, selectionBox])

  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) { // Middle button or Shift+Left
      setIsPanning(true)
      setLastMousePos({ x: e.clientX, y: e.clientY })
      e.preventDefault()
      return
    }

    if (e.button === 0 && !e.shiftKey) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const worldPos = screenToWorld({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }, pan, zoom)
      const snappedPos = { x: snapToGrid(worldPos.x), y: snapToGrid(worldPos.y) }

      // If currently drawing wire, finish it
      if (drawingWire) {
        // Finish drawing wire
        // Check if start and end points are different
        if (drawingWire.x !== snappedPos.x || drawingWire.y !== snappedPos.y) {
          // Check if wire overlaps with existing wires
          if (shouldCreateWire(drawingWire, snappedPos, wires)) {
            addWire({
              start: drawingWire,
              end: snappedPos,
              color: wireColor,
              thickness: wireThickness,
              style: wireStyle
            })
          }
        }
        setDrawingWire(null)
        setCurrentMousePos(null)
        return
      }

      // Don't process if already in a selection operation
      if (isMouseDownInSelectMode) {
        return
      }

      setIsMouseDownInSelectMode(true)

      // Check if clicking on a component first
      let clickedComponent = null
      for (const comp of [...components].reverse()) {
        const componentDef = getComponentByType(comp.type)
        if (!componentDef) continue

        const dx = worldPos.x - comp.x
        const dy = worldPos.y - comp.y
        const angle = -(comp.rotation || 0)
        const localX = dx * Math.cos(angle) - dy * Math.sin(angle)
        const localY = dx * Math.sin(angle) + dy * Math.cos(angle)
        const halfWidth = componentDef.width / 2
        const halfHeight = componentDef.height / 2

        if (Math.abs(localX) <= halfWidth && Math.abs(localY) <= halfHeight) {
          clickedComponent = comp
          break
        }
      }

      if (clickedComponent) {
        // Check if component is already selected
        if (selectedComponentIds.includes(clickedComponent.id)) {
          // Start dragging selected items
          setDraggingSelection(true)
          setSelectionDragStart(worldPos)
        } else {
          // Select and start dragging component
          setSelectedComponent(clickedComponent.id)
          setDraggingComponent(clickedComponent.id)
          setDragOffset({
            x: worldPos.x - clickedComponent.x,
            y: worldPos.y - clickedComponent.y
          })
        }
        return
      }

      // Check if clicking on wire endpoint first
      const endpointThreshold = 8
      let clickedEndpoint = null

      // First check selected wires (higher priority)
      const selectedWires = wires.filter(w => selectedWireIds.includes(w.id) || w.id === selectedWireId)
      for (const wire of selectedWires) {
        const distToStart = Math.sqrt(
          Math.pow(worldPos.x - wire.start.x, 2) + Math.pow(worldPos.y - wire.start.y, 2)
        )
        const distToEnd = Math.sqrt(
          Math.pow(worldPos.x - wire.end.x, 2) + Math.pow(worldPos.y - wire.end.y, 2)
        )

        if (distToStart < endpointThreshold) {
          clickedEndpoint = { wireId: wire.id, endpoint: 'start' }
          break
        } else if (distToEnd < endpointThreshold) {
          clickedEndpoint = { wireId: wire.id, endpoint: 'end' }
          break
        }
      }

      // If no selected wire endpoint found, check all wires
      if (!clickedEndpoint) {
        for (const wire of wires) {
          // Skip already checked selected wires
          if (selectedWireIds.includes(wire.id) || wire.id === selectedWireId) continue

          const distToStart = Math.sqrt(
            Math.pow(worldPos.x - wire.start.x, 2) + Math.pow(worldPos.y - wire.start.y, 2)
          )
          const distToEnd = Math.sqrt(
            Math.pow(worldPos.x - wire.end.x, 2) + Math.pow(worldPos.y - wire.end.y, 2)
          )

          if (distToStart < endpointThreshold) {
            clickedEndpoint = { wireId: wire.id, endpoint: 'start' }
            break
          } else if (distToEnd < endpointThreshold) {
            clickedEndpoint = { wireId: wire.id, endpoint: 'end' }
            break
          }
        }
      }

      if (clickedEndpoint) {
        // Start dragging wire endpoint
        setDraggingWireEnd(clickedEndpoint)
        setSelectedWire(clickedEndpoint.wireId)
        return
      }

      // Check if clicking on wire
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
        // Check if wire is already selected
        if (selectedWireIds.includes(clickedWire.id)) {
          // Start dragging selected items
          setDraggingSelection(true)
          setSelectionDragStart(worldPos)
        } else {
          // Select wire
          setSelectedWire(clickedWire.id)
        }
        return
      }

      // Start selection box
      setSelectionBox({ start: worldPos, end: worldPos })
    }
  }

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const worldPos = screenToWorld({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }, pan, zoom)

    if (isPanning) {
      const dx = e.clientX - lastMousePos.x
      const dy = e.clientY - lastMousePos.y
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      setLastMousePos({ x: e.clientX, y: e.clientY })
    }

    if (drawingWire) {
      setCurrentMousePos({ x: e.clientX, y: e.clientY })
    }

    // Dragging wire endpoint
    if (draggingWireEnd) {
      const snappedPos = { x: snapToGrid(worldPos.x), y: snapToGrid(worldPos.y) }
      const wire = wires.find(w => w.id === draggingWireEnd.wireId)
      if (wire) {
        if (draggingWireEnd.endpoint === 'start') {
          updateWireWithoutHistory(draggingWireEnd.wireId, {
            start: snappedPos
          })
        } else {
          updateWireWithoutHistory(draggingWireEnd.wireId, {
            end: snappedPos
          })
        }
      }
    }

    // Selection box dragging
    if (selectionBox) {
      setSelectionBox(prev => ({ ...prev, end: worldPos }))
    }

    // Dragging selected items
    if (draggingSelection && selectionDragStart) {
      const dx = worldPos.x - selectionDragStart.x
      const dy = worldPos.y - selectionDragStart.y

      // Move all selected components (without snapping during drag)
      selectedComponentIds.forEach(compId => {
        const comp = components.find(c => c.id === compId)
        if (comp) {
          updateComponentWithoutHistory(compId, {
            x: comp.x + dx,
            y: comp.y + dy
          })
        }
      })

      // Move all selected wires (without snapping during drag)
      selectedWireIds.forEach(wireId => {
        const wire = wires.find(w => w.id === wireId)
        if (wire) {
          updateWireWithoutHistory(wireId, {
            start: {
              x: wire.start.x + dx,
              y: wire.start.y + dy
            },
            end: {
              x: wire.end.x + dx,
              y: wire.end.y + dy
            }
          })
        }
      })

      setSelectionDragStart(worldPos)
    }

    if (draggingComponent) {
      const newX = worldPos.x - dragOffset.x
      const newY = worldPos.y - dragOffset.y
      const snappedPos = { x: snapToGrid(newX), y: snapToGrid(newY) }

      updateComponentWithoutHistory(draggingComponent, {
        x: snappedPos.x,
        y: snappedPos.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)

    // Save history if any dragging operation was performed
    const wasDragging = draggingComponent || draggingSelection || draggingWireEnd

    setDraggingComponent(null)

    // Snap selected items to grid after dragging
    if (draggingSelection) {
      selectedComponentIds.forEach(compId => {
        const comp = components.find(c => c.id === compId)
        if (comp) {
          updateComponentWithoutHistory(compId, {
            x: snapToGrid(comp.x),
            y: snapToGrid(comp.y)
          })
        }
      })

      selectedWireIds.forEach(wireId => {
        const wire = wires.find(w => w.id === wireId)
        if (wire) {
          updateWireWithoutHistory(wireId, {
            start: {
              x: snapToGrid(wire.start.x),
              y: snapToGrid(wire.start.y)
            },
            end: {
              x: snapToGrid(wire.end.x),
              y: snapToGrid(wire.end.y)
            }
          })
        }
      })
    }

    setDraggingSelection(false)
    setSelectionDragStart(null)
    setDraggingWireEnd(null)

    // Save to history after all dragging operations complete
    if (wasDragging) {
      saveToHistory()
    }

    // Finish selection box
    if (selectionBox) {
      const { start, end } = selectionBox
      const minX = Math.min(start.x, end.x)
      const maxX = Math.max(start.x, end.x)
      const minY = Math.min(start.y, end.y)
      const maxY = Math.max(start.y, end.y)

      const selectedWires = []
      const selectedComps = []

      // Select wires within box
      wires.forEach(wire => {
        const wireMinX = Math.min(wire.start.x, wire.end.x)
        const wireMaxX = Math.max(wire.start.x, wire.end.x)
        const wireMinY = Math.min(wire.start.y, wire.end.y)
        const wireMaxY = Math.max(wire.start.y, wire.end.y)

        if (wireMinX >= minX && wireMaxX <= maxX && wireMinY >= minY && wireMaxY <= maxY) {
          selectedWires.push(wire.id)
        }
      })

      // Select components within box
      components.forEach(comp => {
        if (comp.x >= minX && comp.x <= maxX && comp.y >= minY && comp.y <= maxY) {
          selectedComps.push(comp.id)
        }
      })

      setMultipleSelection(selectedWires, selectedComps)
      setSelectionBox(null)
    }

    // Reset flag after state updates
    setTimeout(() => {
      setIsMouseDownInSelectMode(false)
    }, 0)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setDrawingWire(null)
      setCurrentMousePos(null)
      setSelectedWire(null)
      setSelectedComponent(null)
      setSelectionBox(null)
      clearSelection()
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault()
      const state = useSchematicStore.getState()

      // Copy selected components and wires
      const selectedComps = state.selectedComponentIds
        .map(id => components.find(c => c.id === id))
        .filter(c => c)
      const selectedWires = state.selectedWireIds
        .map(id => wires.find(w => w.id === id))
        .filter(w => w)

      if (selectedComps.length > 0 || selectedWires.length > 0) {
        copyToClipboard(selectedComps, selectedWires)
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault()
      pasteFromClipboard()
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()

      // Get current state directly from store to avoid stale closure
      const state = useSchematicStore.getState()

      // Check for multiple selections first (selection mode)
      if (state.selectedWireIds.length > 0) {
        state.selectedWireIds.forEach(id => removeWire(id))
        clearSelection()
        return
      }
      if (state.selectedComponentIds.length > 0) {
        state.selectedComponentIds.forEach(id => removeComponent(id))
        clearSelection()
        return
      }

      // Check for single selections (draw mode)
      if (state.selectedWireId) {
        removeWire(state.selectedWireId)
      } else if (state.selectedComponentId) {
        removeComponent(state.selectedComponentId)
      }
    } else if (e.key === 'r' || e.key === 'R') {
      // Get current state directly from store
      const state = useSchematicStore.getState()

      // Rotate multiple selected components as a group (selection mode)
      if (state.selectedComponentIds.length > 0) {
        const selectedComps = state.selectedComponentIds
          .map(id => components.find(c => c.id === id))
          .filter(c => c)

        // Calculate center of selection
        const centerX = selectedComps.reduce((sum, c) => sum + c.x, 0) / selectedComps.length
        const centerY = selectedComps.reduce((sum, c) => sum + c.y, 0) / selectedComps.length

        // Snap center to nearest grid
        const gridCenterX = snapToGrid(centerX)
        const gridCenterY = snapToGrid(centerY)

        selectedComps.forEach(comp => {
          // Translate to origin
          const dx = comp.x - gridCenterX
          const dy = comp.y - gridCenterY

          // Rotate 90 degrees around grid center
          const newX = gridCenterX - dy
          const newY = gridCenterY + dx

          updateComponent(comp.id, {
            x: newX,
            y: newY,
            rotation: (comp.rotation || 0) + Math.PI / 2
          })
        })
      }
      // Rotate single selected component (draw mode)
      else if (state.selectedComponentId) {
        const component = components.find(c => c.id === state.selectedComponentId)
        if (component) {
          const currentRotation = component.rotation || 0
          updateComponent(state.selectedComponentId, {
            rotation: currentRotation + Math.PI / 2
          })
        }
      }
    } else if (e.key === 'f' || e.key === 'F') {
      // Get current state directly from store
      const state = useSchematicStore.getState()

      // Flip multiple selected components horizontally as a group (selection mode)
      if (state.selectedComponentIds.length > 0) {
        const selectedComps = state.selectedComponentIds
          .map(id => components.find(c => c.id === id))
          .filter(c => c)

        // Calculate center of selection
        const centerX = selectedComps.reduce((sum, c) => sum + c.x, 0) / selectedComps.length

        // Snap center to nearest grid
        const gridCenterX = snapToGrid(centerX)

        selectedComps.forEach(comp => {
          // Mirror position around vertical axis at gridCenterX
          const newX = 2 * gridCenterX - comp.x

          // Mirror rotation: horizontal flip means negate and flip the angle
          const currentRotation = comp.rotation || 0
          const newRotation = -currentRotation

          updateComponent(comp.id, {
            x: newX,
            rotation: newRotation,
            flipX: !comp.flipX
          })
        })
      }
      // Flip single selected component (draw mode)
      else if (state.selectedComponentId) {
        const component = components.find(c => c.id === state.selectedComponentId)
        if (component) {
          updateComponent(state.selectedComponentId, {
            flipX: !component.flipX
          })
        }
      }
    } else if (e.key === 'v' || e.key === 'V') {
      // Get current state directly from store
      const state = useSchematicStore.getState()

      // Flip multiple selected components vertically as a group (selection mode)
      if (state.selectedComponentIds.length > 0) {
        const selectedComps = state.selectedComponentIds
          .map(id => components.find(c => c.id === id))
          .filter(c => c)

        // Calculate center of selection
        const centerY = selectedComps.reduce((sum, c) => sum + c.y, 0) / selectedComps.length

        // Snap center to nearest grid
        const gridCenterY = snapToGrid(centerY)

        selectedComps.forEach(comp => {
          // Mirror position around horizontal axis at gridCenterY
          const newY = 2 * gridCenterY - comp.y

          // Mirror rotation: for horizontal axis flip, negate the rotation
          const currentRotation = comp.rotation || 0
          const newRotation = -currentRotation

          updateComponent(comp.id, {
            y: newY,
            rotation: newRotation,
            flipY: !comp.flipY
          })
        })
      }
      // Flip single selected component (draw mode)
      else if (state.selectedComponentId) {
        const component = components.find(c => c.id === state.selectedComponentId)
        if (component) {
          updateComponent(state.selectedComponentId, {
            flipY: !component.flipY
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

  const handleDoubleClick = (e) => {
    if (e.button !== 0) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const worldPos = screenToWorld({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }, pan, zoom)
    const snappedPos = { x: snapToGrid(worldPos.x), y: snapToGrid(worldPos.y) }

    // Start drawing wire on double-click
    if (!drawingWire) {
      setDrawingWire(snappedPos)
      setSelectedWire(null)
      setSelectedComponent(null)
    }
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
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
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
