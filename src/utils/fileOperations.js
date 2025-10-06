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
export function exportToSVG(wires, components, getComponentByType) {
  // Dynamic import for canvas to SVG converter
  import('./canvasToSVG.js').then(({ componentToSVG }) => {
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

    const padding = 50
    const width = maxX - minX + padding * 2
    const height = maxY - minY + padding * 2
    const offsetX = -minX + padding
    const offsetY = -minY + padding

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1a1a1a"/>
  <g transform="translate(${offsetX}, ${offsetY})">
`

    // Draw wires
    wires.forEach(wire => {
      svg += `    <line x1="${wire.start.x}" y1="${wire.start.y}" x2="${wire.end.x}" y2="${wire.end.y}" stroke="${wire.color}" stroke-width="${wire.thickness}" stroke-linecap="round"/>\n`
    })

    // Draw components with actual symbols
    components.forEach(comp => {
      const def = getComponentByType(comp.type)
      if (def) {
        const svgPaths = componentToSVG(def, false)
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
export function exportToPNG(canvas) {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `schematic_${new Date().toISOString().slice(0, 10)}.png`
    link.click()
    URL.revokeObjectURL(url)
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
