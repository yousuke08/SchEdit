// Convert Canvas drawing commands to SVG paths
export class CanvasToSVGConverter {
  constructor(colorOverride = null) {
    this.paths = []
    this.currentPath = []
    this.strokeStyle = '#ffffff'
    this.fillStyle = '#ffffff'
    this.lineWidth = 2
    this.colorOverride = colorOverride
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
      this.paths.push({
        type: 'stroke',
        path: pathData,
        stroke: this.colorOverride || this.strokeStyle,
        strokeWidth: this.lineWidth,
        fill: 'none'
      })
    }
  }

  fill() {
    if (this.currentPath.length > 0) {
      const pathData = this.currentPath.join(' ')
      this.paths.push({
        type: 'fill',
        path: pathData,
        fill: this.colorOverride || this.fillStyle,
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

export function componentToSVG(componentDef, selected = false, colorOverride = null) {
  const converter = new CanvasToSVGConverter(colorOverride)
  componentDef.render(converter, selected)
  return converter.getSVGPaths()
}
