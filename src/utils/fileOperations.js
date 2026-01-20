// Helper function to invert color (only white <-> black, other colors unchanged)
function invertColor(color) {
  // Convert hex color to RGB
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  // Check if the color is grayscale (white/black/gray)
  // If R, G, B are all equal or very close, it's a grayscale color
  const isGrayscale = Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10

  if (isGrayscale) {
    // Invert grayscale colors (white <-> black)
    const invValue = 255 - r
    const invHex = invValue.toString(16).padStart(2, '0')
    return `#${invHex}${invHex}${invHex}`
  }

  // Return original color for non-grayscale colors
  return color
}

// Save project to JSON file
export function saveProjectToJSON(wires, components, rectangles = [], textBoxes = []) {
  const project = {
    version: '1.0',
    wires: wires.map(wire => ({
      start: wire.start,
      end: wire.end,
      color: wire.color,
      thickness: wire.thickness
    })),
    rectangles: rectangles.map(rect => ({
      start: rect.start,
      end: rect.end,
      color: rect.color,
      thickness: rect.thickness,
      style: rect.style || 'solid'
    })),
    textBoxes: textBoxes.map(textBox => ({
      x: textBox.x,
      y: textBox.y,
      text: textBox.text,
      fontSize: textBox.fontSize || 16,
      color: textBox.color || '#ffffff'
    })),
    components: components.map(comp => ({
      type: comp.type,
      x: comp.x,
      y: comp.y,
      rotation: comp.rotation || 0,
      flipX: comp.flipX || false,
      flipY: comp.flipY || false
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

// Calculate bounds of wires, rectangles, text boxes, and components
function calculateBounds(wires, rectangles, textBoxes, components, getComponentByType) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  wires.forEach(wire => {
    minX = Math.min(minX, wire.start.x, wire.end.x)
    minY = Math.min(minY, wire.start.y, wire.end.y)
    maxX = Math.max(maxX, wire.start.x, wire.end.x)
    maxY = Math.max(maxY, wire.start.y, wire.end.y)
  })

  rectangles.forEach(rect => {
    minX = Math.min(minX, rect.start.x, rect.end.x)
    minY = Math.min(minY, rect.start.y, rect.end.y)
    maxX = Math.max(maxX, rect.start.x, rect.end.x)
    maxY = Math.max(maxY, rect.start.y, rect.end.y)
  })

  textBoxes.forEach(textBox => {
    // Rough estimate: 10px per character width, fontSize * 1.2 * lines for height
    const lines = textBox.text.split('\n')
    const textWidth = Math.max(...lines.map(line => line.length * (textBox.fontSize || 16) * 0.6))
    const textHeight = lines.length * (textBox.fontSize || 16) * 1.2

    minX = Math.min(minX, textBox.x)
    minY = Math.min(minY, textBox.y)
    maxX = Math.max(maxX, textBox.x + textWidth)
    maxY = Math.max(maxY, textBox.y + textHeight)
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
    return { minX: 0, maxX: 100, minY: 0, maxY: 100 }
  }

  return { minX, maxX, minY, maxY }
}

// Generate SVG grid
function generateGridSVG(minX, minY, maxX, maxY, gridSize) {
  const gridStartX = Math.floor(minX / gridSize) * gridSize
  const gridStartY = Math.floor(minY / gridSize) * gridSize
  const gridEndX = Math.ceil(maxX / gridSize) * gridSize
  const gridEndY = Math.ceil(maxY / gridSize) * gridSize

  let svg = ''
  for (let x = gridStartX; x <= gridEndX; x += gridSize) {
    svg += `    <line x1="${x}" y1="${gridStartY}" x2="${x}" y2="${gridEndY}" stroke="#333" stroke-width="1"/>\n`
  }
  for (let y = gridStartY; y <= gridEndY; y += gridSize) {
    svg += `    <line x1="${gridStartX}" y1="${y}" x2="${gridEndX}" y2="${y}" stroke="#333" stroke-width="1"/>\n`
  }
  return svg
}

// Generate SVG for wires
function generateWiresSVG(wires, effectiveWireColor, invertColors) {
  let svg = ''
  wires.forEach(wire => {
    let strokeColor = effectiveWireColor || wire.color
    if (invertColors) {
      strokeColor = invertColor(strokeColor)
    }
    svg += `    <line x1="${wire.start.x}" y1="${wire.start.y}" x2="${wire.end.x}" y2="${wire.end.y}" stroke="${strokeColor}" stroke-width="${wire.thickness}" stroke-linecap="round"/>\n`
  })
  return svg
}

// Generate SVG for rectangles
function generateRectanglesSVG(rectangles, effectiveWireColor, invertColors) {
  let svg = ''
  rectangles.forEach(rect => {
    let strokeColor = effectiveWireColor || rect.color
    if (invertColors) {
      strokeColor = invertColor(strokeColor)
    }
    const x = Math.min(rect.start.x, rect.end.x)
    const y = Math.min(rect.start.y, rect.end.y)
    const width = Math.abs(rect.end.x - rect.start.x)
    const height = Math.abs(rect.end.y - rect.start.y)
    const rectStyle = rect.style || 'solid'

    let strokeDasharray = ''
    switch (rectStyle) {
      case 'dashed':
        strokeDasharray = ' stroke-dasharray="10,5"'
        break
      case 'dash-dot':
        strokeDasharray = ' stroke-dasharray="15,5,3,5"'
        break
      default:
        strokeDasharray = ''
    }

    svg += `    <rect x="${x}" y="${y}" width="${width}" height="${height}" stroke="${strokeColor}" stroke-width="${rect.thickness}"${strokeDasharray} fill="none"/>\n`
  })
  return svg
}

// Generate SVG for text boxes
function generateTextBoxesSVG(textBoxes, effectiveWireColor, invertColors) {
  let svg = ''
  textBoxes.forEach(textBox => {
    let fillColor = effectiveWireColor || textBox.color || '#ffffff'
    if (invertColors) {
      fillColor = invertColor(fillColor)
    }
    const lines = textBox.text.split('\n')
    const fontSize = textBox.fontSize || 16
    const lineHeight = fontSize * 1.2

    lines.forEach((line, index) => {
      const y = textBox.y + index * lineHeight + fontSize
      svg += `    <text x="${textBox.x}" y="${y}" fill="${fillColor}" font-size="${fontSize}" font-family="sans-serif">${escapeXml(line)}</text>\n`
    })
  })
  return svg
}

// Helper function to escape XML special characters
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Generate SVG for a single component
function generateComponentSVG(comp, def, componentToSVG, effectiveWireColor, invertColors) {
  let colorOverride = effectiveWireColor
  if (invertColors && !effectiveWireColor) {
    colorOverride = 'invert'
  } else if (invertColors && effectiveWireColor) {
    colorOverride = invertColor(effectiveWireColor)
  }

  const svgPaths = componentToSVG(def, false, colorOverride, invertColors)
  const rotationDeg = (comp.rotation || 0) * 180 / Math.PI
  const scaleX = comp.flipX ? -1 : 1
  const scaleY = comp.flipY ? -1 : 1

  let svg = `    <g transform="translate(${comp.x}, ${comp.y})">\n`
  if (rotationDeg !== 0 || scaleX !== 1 || scaleY !== 1) {
    let transform = ''
    if (rotationDeg !== 0) transform += `rotate(${rotationDeg}) `
    if (scaleX !== 1 || scaleY !== 1) transform += `scale(${scaleX}, ${scaleY})`
    svg += `      <g transform="${transform.trim()}">\n`
    svg += `        ${svgPaths}\n`
    svg += `      </g>\n`
  } else {
    svg += `      ${svgPaths}\n`
  }
  svg += `    </g>\n`
  return svg
}

// Generate SVG for all components
function generateComponentsSVG(components, getComponentByType, componentToSVG, effectiveWireColor, invertColors) {
  let svg = ''
  components.forEach(comp => {
    const def = getComponentByType(comp.type)
    if (def) {
      svg += generateComponentSVG(comp, def, componentToSVG, effectiveWireColor, invertColors)
    }
  })
  return svg
}

// Export to SVG
export async function exportToSVG(wires, rectangles, textBoxes, components, getComponentByType, options = {}) {
  const {
    useWireColor = false,
    wireColor = null,
    invertColors = false,
    backgroundColor = '#1a1a1a',
    transparentBackground = false,
    showGrid = false
  } = options

  const effectiveWireColor = useWireColor ? wireColor : null

  // Dynamic import for canvas to SVG converter
  const { componentToSVG } = await import('./canvasToSVG.js')

  // Check if there's anything to export
  if (wires.length === 0 && rectangles.length === 0 && textBoxes.length === 0 && components.length === 0) {
    alert('エクスポートする内容がありません。')
    return
  }

  // Calculate bounds
  const { minX, maxX, minY, maxY } = calculateBounds(wires, rectangles, textBoxes, components, getComponentByType)

  const padding = 50
  const gridSize = 20
  const width = maxX - minX + padding * 2
  const height = maxY - minY + padding * 2
  const offsetX = -minX + padding
  const offsetY = -minY + padding

  // Build SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
${!transparentBackground ? `  <rect width="100%" height="100%" fill="${backgroundColor}"/>` : ''}
  <g transform="translate(${offsetX}, ${offsetY})">
`

  if (showGrid) {
    svg += generateGridSVG(minX, minY, maxX, maxY, gridSize)
  }

  svg += generateRectanglesSVG(rectangles, effectiveWireColor, invertColors)
  svg += generateWiresSVG(wires, effectiveWireColor, invertColors)
  svg += generateTextBoxesSVG(textBoxes, effectiveWireColor, invertColors)
  svg += generateComponentsSVG(components, getComponentByType, componentToSVG, effectiveWireColor, invertColors)

  svg += `  </g>
</svg>`

  // Check if File System Access API is supported
  if ('showSaveFilePicker' in window) {
    console.log('File System Access API is supported')
    try {
      const defaultFileName = `schematic_${new Date().toISOString().slice(0, 10)}.svg`
      console.log('Opening save dialog with filename:', defaultFileName)
      const handle = await window.showSaveFilePicker({
        suggestedName: defaultFileName,
        types: [
          {
            description: 'SVG Files',
            accept: { 'image/svg+xml': ['.svg'] }
          }
        ]
      })

      console.log('File handle obtained, writing file...')
      const writable = await handle.createWritable()
      await writable.write(svg)
      await writable.close()
      console.log('File saved successfully')
    } catch (err) {
      // User canceled the dialog or error occurred
      console.error('Error during save:', err.name, err.message)
      if (err.name !== 'AbortError') {
        console.error('Failed to save file:', err)
        alert('ファイルの保存に失敗しました。')
      }
    }
  } else {
    console.log('File System Access API not supported, using download fallback')
    // Fallback: Use download link
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `schematic_${new Date().toISOString().slice(0, 10)}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }
}

// Export to PNG
export function exportToPNG(wires, rectangles, textBoxes, components, getComponentByType, canvasRef, options = {}) {
  const {
    useWireColor = false,
    wireColor = null,
    invertColors = false,
    backgroundColor = '#1a1a1a',
    transparentBackground = false,
    showGrid = false
  } = options

  const effectiveWireColor = useWireColor ? wireColor : null

  // Create a temporary canvas for export
  const tempCanvas = document.createElement('canvas')
  const ctx = tempCanvas.getContext('2d', { alpha: true })

  // Check if there's anything to export
  if (wires.length === 0 && rectangles.length === 0 && textBoxes.length === 0 && components.length === 0) {
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

  rectangles.forEach(rect => {
    minX = Math.min(minX, rect.start.x, rect.end.x)
    minY = Math.min(minY, rect.start.y, rect.end.y)
    maxX = Math.max(maxX, rect.start.x, rect.end.x)
    maxY = Math.max(maxY, rect.start.y, rect.end.y)
  })

  textBoxes.forEach(textBox => {
    const lines = textBox.text.split('\n')
    const textWidth = Math.max(...lines.map(line => line.length * (textBox.fontSize || 16) * 0.6))
    const textHeight = lines.length * (textBox.fontSize || 16) * 1.2

    minX = Math.min(minX, textBox.x)
    minY = Math.min(minY, textBox.y)
    maxX = Math.max(maxX, textBox.x + textWidth)
    maxY = Math.max(maxY, textBox.y + textHeight)
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

  // Draw rectangles
  rectangles.forEach(rect => {
    let strokeColor = effectiveWireColor || rect.color
    if (invertColors) {
      strokeColor = invertColor(strokeColor)
    }
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = rect.thickness
    ctx.lineCap = 'square'
    ctx.lineJoin = 'miter'

    const x = Math.min(rect.start.x, rect.end.x)
    const y = Math.min(rect.start.y, rect.end.y)
    const width = Math.abs(rect.end.x - rect.start.x)
    const height = Math.abs(rect.end.y - rect.start.y)

    const rectStyle = rect.style || 'solid'

    // Apply line style
    switch (rectStyle) {
      case 'solid':
        ctx.setLineDash([])
        break
      case 'dashed':
        ctx.setLineDash([10, 5])
        break
      case 'dash-dot':
        ctx.setLineDash([15, 5, 3, 5])
        break
      default:
        ctx.setLineDash([])
    }

    ctx.beginPath()
    ctx.rect(x, y, width, height)
    ctx.stroke()

    ctx.setLineDash([])
  })

  // Draw wires
  wires.forEach(wire => {
    let strokeColor = effectiveWireColor || wire.color
    if (invertColors) {
      strokeColor = invertColor(strokeColor)
    }
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = wire.thickness
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(wire.start.x, wire.start.y)
    ctx.lineTo(wire.end.x, wire.end.y)
    ctx.stroke()
  })

  // Draw text boxes
  textBoxes.forEach(textBox => {
    let fillColor = effectiveWireColor || textBox.color || '#ffffff'
    if (invertColors) {
      fillColor = invertColor(fillColor)
    }
    ctx.fillStyle = fillColor
    ctx.font = `${textBox.fontSize || 16}px sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const lines = textBox.text.split('\n')
    const lineHeight = (textBox.fontSize || 16) * 1.2

    lines.forEach((line, index) => {
      ctx.fillText(line, textBox.x, textBox.y + index * lineHeight)
    })
  })

  // Draw components
  components.forEach(comp => {
    const def = getComponentByType(comp.type)
    if (def) {
      ctx.save()
      ctx.translate(comp.x, comp.y)
      ctx.rotate(comp.rotation || 0)

      // Override colors if effectiveWireColor is specified or invertColors is enabled
      if (effectiveWireColor || invertColors) {
        // Create a proxy context that intercepts strokeStyle and fillStyle
        const proxyCtx = new Proxy(ctx, {
          get(target, prop) {
            if (prop === 'strokeStyle' || prop === 'fillStyle') {
              if (effectiveWireColor) {
                return invertColors ? invertColor(effectiveWireColor) : effectiveWireColor
              }
              // If no effectiveWireColor but invertColors is true, return inverted default
              return target[prop] // Will be intercepted on set
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
              if (effectiveWireColor) {
                target[prop] = invertColors ? invertColor(effectiveWireColor) : effectiveWireColor
              } else if (invertColors) {
                target[prop] = invertColor(value)
              } else {
                target[prop] = value
              }
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

  // Export
  tempCanvas.toBlob((blob) => {
    if (!blob) {
      alert('PNG生成に失敗しました。')
      return
    }
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `schematic_${new Date().toISOString().slice(0, 10)}.png`
    link.click()
    URL.revokeObjectURL(url)
  })
}

// Save to localStorage
export function saveToLocalStorage(wires, rectangles, textBoxes, components) {
  const project = {
    version: '1.0',
    wires,
    rectangles,
    textBoxes,
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
