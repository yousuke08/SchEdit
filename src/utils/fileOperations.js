// Save project to JSON file
export function saveProjectToJSON(wires, components) {
  const project = {
    version: '1.0',
    wires: wires.map(wire => ({
      start: wire.start,
      end: wire.end,
      color: wire.color,
      thickness: wire.thickness
    })),
    components: components.map(comp => ({
      type: comp.type,
      x: comp.x,
      y: comp.y,
      rotation: comp.rotation || 0
    }))
  }

  const json = JSON.stringify(project, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `schematic_${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

// Load project from JSON file
export function loadProjectFromJSON(file, onLoad) {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const project = JSON.parse(e.target.result)
      onLoad(project)
    } catch (error) {
      console.error('Failed to load project:', error)
      alert('ファイルの読み込みに失敗しました。')
    }
  }
  reader.readAsText(file)
}

// Export to SVG
export function exportToSVG(wires, components, getComponentByType, options = {}) {
  const {
    wireColor = null,
    backgroundColor = '#1a1a1a',
    transparentBackground = false,
    showGrid = false
  } = options

  // Dynamic import for canvas to SVG converter
  import('./canvasToSVG.js').then(({ componentToSVG }) => {
    // Check if there's anything to export
    if (wires.length === 0 && components.length === 0) {
      alert('エクスポートする内容がありません。')
      return
    }

    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    wires.forEach(wire => {
      minX = Math.min(minX, wire.start.x, wire.end.x)
      minY = Math.min(minY, wire.start.y, wire.end.y)
      maxX = Math.max(maxX, wire.start.x, wire.end.x)
      maxY = Math.max(maxY, wire.start.y, wire.end.y)
    })

    components.forEach(comp => {
      const def = getComponentByType(comp.type)
      if (def) {
        minX = Math.min(minX, comp.x - def.width / 2)
        minY = Math.min(minY, comp.y - def.height / 2)
        maxX = Math.max(maxX, comp.x + def.width / 2)
        maxY = Math.max(maxY, comp.y + def.height / 2)
      }
    })

    // If bounds are still infinite, set default values
    if (!isFinite(minX)) {
      minX = 0
      maxX = 100
      minY = 0
      maxY = 100
    }

    const padding = 50
    const gridSize = 20
    const width = maxX - minX + padding * 2
    const height = maxY - minY + padding * 2
    const offsetX = -minX + padding
    const offsetY = -minY + padding

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
${!transparentBackground ? `  <rect width="100%" height="100%" fill="${backgroundColor}"/>` : ''}
  <g transform="translate(${offsetX}, ${offsetY})">
`

    // Draw grid if enabled
    if (showGrid) {
      const gridStartX = Math.floor(minX / gridSize) * gridSize
      const gridStartY = Math.floor(minY / gridSize) * gridSize
      const gridEndX = Math.ceil(maxX / gridSize) * gridSize
      const gridEndY = Math.ceil(maxY / gridSize) * gridSize

      for (let x = gridStartX; x <= gridEndX; x += gridSize) {
        svg += `    <line x1="${x}" y1="${gridStartY}" x2="${x}" y2="${gridEndY}" stroke="#333" stroke-width="1"/>\n`
      }
      for (let y = gridStartY; y <= gridEndY; y += gridSize) {
        svg += `    <line x1="${gridStartX}" y1="${y}" x2="${gridEndX}" y2="${y}" stroke="#333" stroke-width="1"/>\n`
      }
    }

    // Draw wires
    wires.forEach(wire => {
      const strokeColor = wireColor || wire.color
      svg += `    <line x1="${wire.start.x}" y1="${wire.start.y}" x2="${wire.end.x}" y2="${wire.end.y}" stroke="${strokeColor}" stroke-width="${wire.thickness}" stroke-linecap="round"/>\n`
    })

    // Draw components with actual symbols
    components.forEach(comp => {
      const def = getComponentByType(comp.type)
      if (def) {
        const svgPaths = componentToSVG(def, false, wireColor)
        svg += `    <g transform="translate(${comp.x}, ${comp.y}) rotate(${(comp.rotation || 0) * 180 / Math.PI})">\n`
        svg += `      ${svgPaths}\n`
        svg += `    </g>\n`
      }
    })

    svg += `  </g>
</svg>`

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `schematic_${new Date().toISOString().slice(0, 10)}.svg`
    link.click()
    URL.revokeObjectURL(url)
  })
}

// Export to PNG
export function exportToPNG(wires, components, getComponentByType, canvasRef, options = {}) {
  console.log('exportToPNG called with:', { wires, components, options })

  const {
    wireColor = null,
    backgroundColor = '#1a1a1a',
    transparentBackground = false,
    showGrid = false
  } = options

  // Create a temporary canvas for export
  const tempCanvas = document.createElement('canvas')
  const ctx = tempCanvas.getContext('2d', { alpha: true })

  console.log('tempCanvas created:', tempCanvas)

  // Check if there's anything to export
  if (wires.length === 0 && components.length === 0) {
    console.error('Nothing to export')
    alert('エクスポートする内容がありません。')
    return
  }

  // Calculate bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  wires.forEach(wire => {
    minX = Math.min(minX, wire.start.x, wire.end.x)
    minY = Math.min(minY, wire.start.y, wire.end.y)
    maxX = Math.max(maxX, wire.start.x, wire.end.x)
    maxY = Math.max(maxY, wire.start.y, wire.end.y)
  })

  components.forEach(comp => {
    const def = getComponentByType(comp.type)
    if (def) {
      minX = Math.min(minX, comp.x - def.width / 2)
      minY = Math.min(minY, comp.y - def.height / 2)
      maxX = Math.max(maxX, comp.x + def.width / 2)
      maxY = Math.max(maxY, comp.y + def.height / 2)
    }
  })

  // If bounds are still infinite, set default values
  if (!isFinite(minX)) {
    minX = 0
    maxX = 100
    minY = 0
    maxY = 100
  }

  const padding = 50
  const gridSize = 20
  const width = maxX - minX + padding * 2
  const height = maxY - minY + padding * 2
  const offsetX = -minX + padding
  const offsetY = -minY + padding

  console.log('Canvas dimensions:', { width, height, minX, minY, maxX, maxY })

  tempCanvas.width = width
  tempCanvas.height = height

  // Draw background
  if (!transparentBackground) {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
  }

  ctx.save()
  ctx.translate(offsetX, offsetY)

  // Draw grid if enabled
  if (showGrid) {
    const gridStartX = Math.floor(minX / gridSize) * gridSize
    const gridStartY = Math.floor(minY / gridSize) * gridSize
    const gridEndX = Math.ceil(maxX / gridSize) * gridSize
    const gridEndY = Math.ceil(maxY / gridSize) * gridSize

    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = gridStartX; x <= gridEndX; x += gridSize) {
      ctx.moveTo(x, gridStartY)
      ctx.lineTo(x, gridEndY)
    }
    for (let y = gridStartY; y <= gridEndY; y += gridSize) {
      ctx.moveTo(gridStartX, y)
      ctx.lineTo(gridEndX, y)
    }
    ctx.stroke()
  }

  // Draw wires
  wires.forEach(wire => {
    ctx.strokeStyle = wireColor || wire.color
    ctx.lineWidth = wire.thickness
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(wire.start.x, wire.start.y)
    ctx.lineTo(wire.end.x, wire.end.y)
    ctx.stroke()
  })

  // Draw components
  components.forEach(comp => {
    const def = getComponentByType(comp.type)
    if (def) {
      ctx.save()
      ctx.translate(comp.x, comp.y)
      ctx.rotate(comp.rotation || 0)

      // Override colors if wireColor is specified
      if (wireColor) {
        // Create a proxy context that intercepts strokeStyle and fillStyle
        const proxyCtx = new Proxy(ctx, {
          get(target, prop) {
            if (prop === 'strokeStyle' || prop === 'fillStyle') {
              return wireColor
            }
            const value = target[prop]
            // Bind methods to the original context
            if (typeof value === 'function') {
              return value.bind(target)
            }
            return value
          },
          set(target, prop, value) {
            if (prop === 'strokeStyle' || prop === 'fillStyle') {
              target[prop] = wireColor
              return true
            }
            target[prop] = value
            return true
          }
        })
        def.render(proxyCtx, false)
      } else {
        def.render(ctx, false)
      }

      ctx.restore()
    }
  })

  ctx.restore()

  console.log('Drawing complete, converting to blob...')

  // Export
  tempCanvas.toBlob((blob) => {
    console.log('Blob created:', blob)
    if (!blob) {
      console.error('Failed to create blob')
      alert('PNG生成に失敗しました。')
      return
    }
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `schematic_${new Date().toISOString().slice(0, 10)}.png`
    link.click()
    URL.revokeObjectURL(url)
    console.log('PNG export completed')
  })
}

// Save to localStorage
export function saveToLocalStorage(wires, components) {
  const project = {
    version: '1.0',
    wires,
    components,
    savedAt: new Date().toISOString()
  }
  localStorage.setItem('schedit_autosave', JSON.stringify(project))
}

// Load from localStorage
export function loadFromLocalStorage() {
  const data = localStorage.getItem('schedit_autosave')
  if (data) {
    try {
      return JSON.parse(data)
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }
  return null
}
