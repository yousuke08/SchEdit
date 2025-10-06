// Helper function to invert color
function invertColorSVG(color) {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  const invR = (255 - r).toString(16).padStart(2, '0')
  const invG = (255 - g).toString(16).padStart(2, '0')
  const invB = (255 - b).toString(16).padStart(2, '0')

  return `#${invR}${invG}${invB}`
}

// Convert Canvas drawing commands to SVG paths
export class CanvasToSVGConverter {
  constructor(colorOverride = null, invertColors = false) {
    this.paths = []
    this.currentPath = []
    this.strokeStyle = '#ffffff'
    this.fillStyle = '#ffffff'
    this.lineWidth = 2
    this.colorOverride = colorOverride
    this.invertColors = invertColors
  }

  // Mock Canvas context methods
  beginPath() {
    this.currentPath = []
  }

  moveTo(x, y) {
    this.currentPath.push(`M ${x} ${y}`)
  }

  lineTo(x, y) {
    this.currentPath.push(`L ${x} ${y}`)
  }

  arc(x, y, radius, startAngle, endAngle, anticlockwise) {
    // Convert arc to path
    const start = {
      x: x + radius * Math.cos(startAngle),
      y: y + radius * Math.sin(startAngle)
    }
    const end = {
      x: x + radius * Math.cos(endAngle),
      y: y + radius * Math.sin(endAngle)
    }

    const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0
    const sweep = anticlockwise ? 0 : 1

    if (this.currentPath.length === 0) {
      this.currentPath.push(`M ${start.x} ${start.y}`)
    }
    this.currentPath.push(`A ${radius} ${radius} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`)
  }

  closePath() {
    this.currentPath.push('Z')
  }

  stroke() {
    if (this.currentPath.length > 0) {
      const pathData = this.currentPath.join(' ')
      let strokeColor = this.colorOverride || this.strokeStyle
      if (strokeColor === 'invert') {
        strokeColor = invertColorSVG(this.strokeStyle)
      } else if (this.invertColors && !this.colorOverride) {
        strokeColor = invertColorSVG(this.strokeStyle)
      }
      this.paths.push({
        type: 'stroke',
        path: pathData,
        stroke: strokeColor,
        strokeWidth: this.lineWidth,
        fill: 'none'
      })
    }
  }

  fill() {
    if (this.currentPath.length > 0) {
      const pathData = this.currentPath.join(' ')
      let fillColor = this.colorOverride || this.fillStyle
      if (fillColor === 'invert') {
        fillColor = invertColorSVG(this.fillStyle)
      } else if (this.invertColors && !this.colorOverride) {
        fillColor = invertColorSVG(this.fillStyle)
      }
      this.paths.push({
        type: 'fill',
        path: pathData,
        fill: fillColor,
        stroke: 'none'
      })
    }
  }

  save() {
    // Not needed for SVG conversion
  }

  restore() {
    // Not needed for SVG conversion
  }

  getSVGPaths() {
    return this.paths.map(p =>
      `<path d="${p.path}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="${p.fill}" stroke-linecap="round" stroke-linejoin="round"/>`
    ).join('\n      ')
  }
}

export function componentToSVG(componentDef, selected = false, colorOverride = null, invertColors = false) {
  const converter = new CanvasToSVGConverter(colorOverride, invertColors)
  componentDef.render(converter, selected)
  return converter.getSVGPaths()
}
