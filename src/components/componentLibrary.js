// Component library with basic power electronics components

export const componentLibrary = {
  resistor: {
    name: '抵抗 (JIS)',
    category: 'passive',
    width: 60,
    height: 20,
    pins: [
      { id: 'p1', x: 0, y: 0, label: '1' },
      { id: 'p2', x: 60, y: 0, label: '2' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2
      ctx.fillStyle = 'transparent'

      // Draw JIS resistor symbol (rectangle)
      // Origin at left wire start, 3 grid (60px) total
      ctx.beginPath()
      ctx.rect(10, -5, 40, 10)
      ctx.moveTo(0, 0)
      ctx.lineTo(10, 0)
      ctx.moveTo(50, 0)
      ctx.lineTo(60, 0)
      ctx.stroke()
    }
  },

  resistor_us: {
    name: '抵抗 (ジグザグ)',
    category: 'passive',
    width: 60,
    height: 20,
    pins: [
      { id: 'p1', x: 0, y: 0, label: '1' },
      { id: 'p2', x: 60, y: 0, label: '2' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2
      ctx.fillStyle = 'transparent'

      // Draw zigzag resistor symbol (point symmetric, 3 peaks 3 valleys)
      // Draw left half (1.5 peaks), then rotate 180° around center for right half
      // Wire lead: 12.5px, zigzag compressed to fit

      // Left half
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(10.5, 0)    // 配線 (dx=12.5, dy=0)
      ctx.lineTo(14.5, 7)    // 谷1 (dx=5, dy=7)
      ctx.lineTo(20.5, -7)   // 山1 (dx=5, dy=-14)
      ctx.lineTo(26.5, 7)    // 谷2 (dx=5, dy=14)
      ctx.lineTo(30, 0)      // 山の半分 (dx=2.5, dy=-7)
      ctx.stroke()

      // Right half - rotate 180° around center point (30, 0)
      ctx.save()
      ctx.translate(30, 0)
      ctx.rotate(Math.PI)
      ctx.translate(-30, 0)

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(10.5, 0)
      ctx.lineTo(14.5, 7)
      ctx.lineTo(20.5, -7)
      ctx.lineTo(26.5, 7)
      ctx.lineTo(30, 0)
      ctx.stroke()

      ctx.restore()
    }
  },

  capacitor: {
    name: 'コンデンサ',
    category: 'passive',
    width: 60,
    height: 40,
    pins: [
      { id: 'p1', x: 0, y: 0, label: '1' },
      { id: 'p2', x: 60, y: 0, label: '2' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Draw JIS capacitor symbol (two parallel vertical lines, horizontal orientation)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(25, 0)
      ctx.moveTo(25, -12)
      ctx.lineTo(25, 12)
      ctx.moveTo(35, -12)
      ctx.lineTo(35, 12)
      ctx.moveTo(35, 0)
      ctx.lineTo(60, 0)
      ctx.stroke()
    }
  },

  inductor: {
    name: 'インダクタ (JIS)',
    category: 'passive',
    width: 60,
    height: 40,
    pins: [
      { id: 'p1', x: 0, y: 0, label: '1' },
      { id: 'p2', x: 60, y: 0, label: '2' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2
      ctx.fillStyle = 'transparent'

      // Draw JIS inductor symbol (rectangle with diagonal line)
      ctx.beginPath()
      ctx.rect(10, -8, 40, 16)
      ctx.moveTo(0, 0)
      ctx.lineTo(10, 0)
      ctx.moveTo(15, -8)
      ctx.lineTo(20, 8)
      ctx.moveTo(50, 0)
      ctx.lineTo(60, 0)
      ctx.stroke()
    }
  },

  inductor_coil: {
    name: 'インダクタ (巻線)',
    category: 'passive',
    width: 60,
    height: 40,
    pins: [
      { id: 'p1', x: 0, y: 0, label: '1' },
      { id: 'p2', x: 60, y: 0, label: '2' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2
      ctx.fillStyle = 'transparent'

      // Draw coil inductor symbol
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(10, 0)

      // Draw 4 coils
      for (let i = 0; i < 4; i++) {
        const x = 10 + i * 10
        ctx.arc(x + 5, 0, 5, Math.PI, 0, false)
      }

      ctx.lineTo(60, 0)
      ctx.stroke()
    }
  },

  diode: {
    name: 'ダイオード',
    category: 'semiconductor',
    width: 60,
    height: 30,
    pins: [
      { id: 'anode', x: 0, y: 0, label: 'A' },
      { id: 'cathode', x: 60, y: 0, label: 'K' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.fillStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Draw JIS diode symbol (triangle and line)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(20, 0)
      ctx.stroke()

      // Triangle (anode side)
      ctx.beginPath()
      ctx.moveTo(20, -10)
      ctx.lineTo(20, 10)
      ctx.lineTo(40, 0)
      ctx.closePath()
      ctx.fill()

      // Cathode line
      ctx.beginPath()
      ctx.moveTo(40, -10)
      ctx.lineTo(40, 10)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(40, 0)
      ctx.lineTo(60, 0)
      ctx.stroke()
    }
  },

  mosfet_n: {
    name: 'N-ch MOSFET',
    category: 'semiconductor',
    width: 60,
    height: 60,
    pins: [
      { id: 'gate', x: -30, y: 0, label: 'G' },
      { id: 'drain', x: 10, y: -30, label: 'D' },
      { id: 'source', x: 10, y: 30, label: 'S' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Gate terminal
      ctx.beginPath()
      ctx.moveTo(-30, 0)
      ctx.lineTo(-8, 0)
      ctx.stroke()

      // Gate line (vertical)
      ctx.beginPath()
      ctx.moveTo(-8, -18)
      ctx.lineTo(-8, 18)
      ctx.stroke()

      // Channel segments (3 short lines)
      ctx.beginPath()
      ctx.moveTo(0, -18)
      ctx.lineTo(0, -6)
      ctx.moveTo(0, -3)
      ctx.lineTo(0, 3)
      ctx.moveTo(0, 6)
      ctx.lineTo(0, 18)
      ctx.stroke()

      // Drain connection
      ctx.beginPath()
      ctx.moveTo(0, -12)
      ctx.lineTo(10, -12)
      ctx.lineTo(10, -30)
      ctx.stroke()

      // Source connection
      ctx.beginPath()
      ctx.moveTo(0, 12)
      ctx.lineTo(10, 12)
      ctx.lineTo(10, 30)
      ctx.stroke()

      // Substrate/Body connection (center tap)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(10, 0)
      ctx.stroke()

      // Circle enclosure
      ctx.beginPath()
      ctx.arc(3, 0, 24, 0, Math.PI * 2)
      ctx.stroke()
    }
  },

  gnd: {
    name: 'GND',
    category: 'symbol',
    width: 40,
    height: 40,
    pins: [
      { id: 'p1', x: 0, y: -20, label: '' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Draw GND symbol
      ctx.beginPath()
      ctx.moveTo(0, -20)
      ctx.lineTo(0, 0)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-15, 0)
      ctx.lineTo(15, 0)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-10, 5)
      ctx.lineTo(10, 5)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-5, 10)
      ctx.lineTo(5, 10)
      ctx.stroke()
    }
  },

  voltage_source: {
    name: '電圧源',
    category: 'source',
    width: 24,
    height: 60,
    pins: [
      { id: 'pos', x: 0, y: 0, label: '+' },
      { id: 'neg', x: 0, y: 60, label: '-' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Based on capacitor structure (vertical)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, 25)
      ctx.stroke()

      // Positive plate (long horizontal line)
      ctx.beginPath()
      ctx.moveTo(-12, 25)
      ctx.lineTo(12, 25)
      ctx.stroke()

      // Negative plate (short horizontal line)
      ctx.beginPath()
      ctx.moveTo(-6, 35)
      ctx.lineTo(6, 35)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, 35)
      ctx.lineTo(0, 60)
      ctx.stroke()
    }
  },

  current_source: {
    name: '電流源',
    category: 'source',
    width: 24,
    height: 60,
    pins: [
      { id: 'pos', x: 0, y: 0, label: '+' },
      { id: 'neg', x: 0, y: 60, label: '-' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Circle centered at y=30, width is 24 (radius 12)
      ctx.beginPath()
      ctx.arc(0, 30, 12, 0, Math.PI * 2)
      ctx.stroke()

      // Terminals
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, 18)
      ctx.moveTo(0, 42)
      ctx.lineTo(0, 60)
      ctx.stroke()

      // Arrow pointing up inside circle
      ctx.beginPath()
      ctx.moveTo(0, 36)
      ctx.lineTo(0, 24)
      ctx.lineTo(-4, 28)
      ctx.moveTo(0, 24)
      ctx.lineTo(4, 28)
      ctx.stroke()
    }
  },

  mosfet_p: {
    name: 'P-ch MOSFET',
    category: 'semiconductor',
    width: 60,
    height: 60,
    pins: [
      { id: 'gate', x: -30, y: 0, label: 'G' },
      { id: 'drain', x: 10, y: 30, label: 'D' },
      { id: 'source', x: 10, y: -30, label: 'S' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Gate terminal
      ctx.beginPath()
      ctx.moveTo(-30, 0)
      ctx.lineTo(-8, 0)
      ctx.stroke()

      // Gate line (vertical)
      ctx.beginPath()
      ctx.moveTo(-8, -18)
      ctx.lineTo(-8, 18)
      ctx.stroke()

      // Channel segments (3 short lines)
      ctx.beginPath()
      ctx.moveTo(0, -18)
      ctx.lineTo(0, -6)
      ctx.moveTo(0, -3)
      ctx.lineTo(0, 3)
      ctx.moveTo(0, 6)
      ctx.lineTo(0, 18)
      ctx.stroke()

      // Source connection (top for P-ch)
      ctx.beginPath()
      ctx.moveTo(0, -12)
      ctx.lineTo(10, -12)
      ctx.lineTo(10, -30)
      ctx.stroke()

      // Drain connection (bottom for P-ch)
      ctx.beginPath()
      ctx.moveTo(0, 12)
      ctx.lineTo(10, 12)
      ctx.lineTo(10, 30)
      ctx.stroke()

      // Body connection with arrow pointing inward (P-ch)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(10, 0)
      ctx.moveTo(-4, 0)
      ctx.lineTo(0, 0)
      ctx.lineTo(-2, -3)
      ctx.moveTo(0, 0)
      ctx.lineTo(-2, 3)
      ctx.stroke()

      // Circle enclosure
      ctx.beginPath()
      ctx.arc(3, 0, 24, 0, Math.PI * 2)
      ctx.stroke()
    }
  },

  mosfet_n_diode: {
    name: 'N-ch MOSFET (ダイオード付)',
    category: 'semiconductor',
    width: 60,
    height: 60,
    pins: [
      { id: 'gate', x: -30, y: 0, label: 'G' },
      { id: 'drain', x: 10, y: -30, label: 'D' },
      { id: 'source', x: 10, y: 30, label: 'S' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.fillStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Gate terminal
      ctx.beginPath()
      ctx.moveTo(-30, 0)
      ctx.lineTo(-8, 0)
      ctx.stroke()

      // Gate line (vertical)
      ctx.beginPath()
      ctx.moveTo(-8, -18)
      ctx.lineTo(-8, 18)
      ctx.stroke()

      // Channel segments (3 short lines)
      ctx.beginPath()
      ctx.moveTo(0, -18)
      ctx.lineTo(0, -6)
      ctx.moveTo(0, -3)
      ctx.lineTo(0, 3)
      ctx.moveTo(0, 6)
      ctx.lineTo(0, 18)
      ctx.stroke()

      // Drain connection
      ctx.beginPath()
      ctx.moveTo(0, -12)
      ctx.lineTo(10, -12)
      ctx.lineTo(10, -30)
      ctx.stroke()

      // Source connection
      ctx.beginPath()
      ctx.moveTo(0, 12)
      ctx.lineTo(10, 12)
      ctx.lineTo(10, 30)
      ctx.stroke()

      // Body connection
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(10, 0)
      ctx.stroke()

      // Body diode (vertical, cathode at drain side)
      ctx.save()
      ctx.translate(16, 0)
      ctx.rotate(Math.PI / 2)

      // Triangle pointing right (toward drain)
      ctx.beginPath()
      ctx.moveTo(-4, -3)
      ctx.lineTo(-4, 3)
      ctx.lineTo(0, 0)
      ctx.closePath()
      ctx.fill()

      // Cathode line
      ctx.beginPath()
      ctx.moveTo(0, -3)
      ctx.lineTo(0, 3)
      ctx.stroke()

      ctx.restore()

      // Circle enclosure
      ctx.beginPath()
      ctx.arc(3, 0, 24, 0, Math.PI * 2)
      ctx.stroke()
    }
  },

  bjt_npn: {
    name: 'NPN トランジスタ',
    category: 'semiconductor',
    width: 60,
    height: 60,
    pins: [
      { id: 'base', x: -30, y: 0, label: 'B' },
      { id: 'collector', x: 10, y: -30, label: 'C' },
      { id: 'emitter', x: 10, y: 30, label: 'E' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.fillStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Base terminal
      ctx.beginPath()
      ctx.moveTo(-30, 0)
      ctx.lineTo(-5, 0)
      ctx.stroke()

      // Base line (vertical)
      ctx.beginPath()
      ctx.moveTo(-5, -15)
      ctx.lineTo(-5, 15)
      ctx.stroke()

      // Collector connection
      ctx.beginPath()
      ctx.moveTo(-5, -10)
      ctx.lineTo(10, -20)
      ctx.lineTo(10, -30)
      ctx.stroke()

      // Emitter connection
      ctx.beginPath()
      ctx.moveTo(-5, 10)
      ctx.lineTo(10, 20)
      ctx.lineTo(10, 30)
      ctx.stroke()

      // Emitter arrow (pointing outward for NPN)
      ctx.beginPath()
      ctx.moveTo(10, 20)
      ctx.lineTo(6, 15)
      ctx.moveTo(10, 20)
      ctx.lineTo(5, 20)
      ctx.fill()

      // Circle enclosure
      ctx.beginPath()
      ctx.arc(3, 0, 24, 0, Math.PI * 2)
      ctx.stroke()
    }
  },

  bjt_pnp: {
    name: 'PNP トランジスタ',
    category: 'semiconductor',
    width: 60,
    height: 60,
    pins: [
      { id: 'base', x: -30, y: 0, label: 'B' },
      { id: 'collector', x: 10, y: 30, label: 'C' },
      { id: 'emitter', x: 10, y: -30, label: 'E' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.fillStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Base terminal
      ctx.beginPath()
      ctx.moveTo(-30, 0)
      ctx.lineTo(-5, 0)
      ctx.stroke()

      // Base line (vertical)
      ctx.beginPath()
      ctx.moveTo(-5, -15)
      ctx.lineTo(-5, 15)
      ctx.stroke()

      // Emitter connection (top for PNP)
      ctx.beginPath()
      ctx.moveTo(-5, -10)
      ctx.lineTo(10, -20)
      ctx.lineTo(10, -30)
      ctx.stroke()

      // Collector connection (bottom for PNP)
      ctx.beginPath()
      ctx.moveTo(-5, 10)
      ctx.lineTo(10, 20)
      ctx.lineTo(10, 30)
      ctx.stroke()

      // Base arrow (pointing inward for PNP)
      ctx.beginPath()
      ctx.moveTo(-5, -10)
      ctx.lineTo(-9, -5)
      ctx.moveTo(-5, -10)
      ctx.lineTo(-10, -10)
      ctx.fill()

      // Circle enclosure
      ctx.beginPath()
      ctx.arc(3, 0, 24, 0, Math.PI * 2)
      ctx.stroke()
    }
  },

  diode_schottky: {
    name: 'ショットキーダイオード',
    category: 'semiconductor',
    width: 60,
    height: 30,
    pins: [
      { id: 'anode', x: 0, y: 0, label: 'A' },
      { id: 'cathode', x: 60, y: 0, label: 'K' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.fillStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Wire
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(20, 0)
      ctx.stroke()

      // Triangle (anode side)
      ctx.beginPath()
      ctx.moveTo(20, -10)
      ctx.lineTo(20, 10)
      ctx.lineTo(40, 0)
      ctx.closePath()
      ctx.fill()

      // Cathode with Schottky symbol (S shape)
      ctx.beginPath()
      ctx.moveTo(40, -10)
      ctx.lineTo(40, 10)
      ctx.moveTo(40, -10)
      ctx.lineTo(35, -10)
      ctx.moveTo(40, 10)
      ctx.lineTo(45, 10)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(40, 0)
      ctx.lineTo(60, 0)
      ctx.stroke()
    }
  },

  diode_zener: {
    name: 'ツェナーダイオード',
    category: 'semiconductor',
    width: 60,
    height: 30,
    pins: [
      { id: 'anode', x: 0, y: 0, label: 'A' },
      { id: 'cathode', x: 60, y: 0, label: 'K' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.fillStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Wire
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(20, 0)
      ctx.stroke()

      // Triangle (anode side)
      ctx.beginPath()
      ctx.moveTo(20, -10)
      ctx.lineTo(20, 10)
      ctx.lineTo(40, 0)
      ctx.closePath()
      ctx.fill()

      // Cathode with Zener symbol (Z shape)
      ctx.beginPath()
      ctx.moveTo(40, -10)
      ctx.lineTo(40, 10)
      ctx.moveTo(40, -10)
      ctx.lineTo(35, -10)
      ctx.lineTo(35, -6)
      ctx.moveTo(40, 10)
      ctx.lineTo(45, 10)
      ctx.lineTo(45, 6)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(40, 0)
      ctx.lineTo(60, 0)
      ctx.stroke()
    }
  },

  capacitor_electrolytic: {
    name: '電解コンデンサ',
    category: 'passive',
    width: 24,
    height: 60,
    pins: [
      { id: 'pos', x: 0, y: 0, label: '+' },
      { id: 'neg', x: 0, y: 60, label: '-' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Draw same as regular capacitor (vertical)
      // Width is 24 (-12 to 12), centered at x=0
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, 25)
      ctx.moveTo(-12, 25)
      ctx.lineTo(12, 25)
      ctx.moveTo(-12, 35)
      ctx.lineTo(12, 35)
      ctx.moveTo(0, 35)
      ctx.lineTo(0, 60)
      ctx.stroke()

      // Add hatching between the two plates (3 lines)
      ctx.beginPath()
      ctx.moveTo(-10, 26)
      ctx.lineTo(-5, 34)
      ctx.moveTo(-1, 26)
      ctx.lineTo(3, 34)
      ctx.moveTo(8, 26)
      ctx.lineTo(12, 34)
      ctx.stroke()

      // + symbol (small, upper left)
      ctx.beginPath()
      ctx.moveTo(-10, 16)
      ctx.lineTo(-10, 8)
      ctx.moveTo(-14, 12)
      ctx.lineTo(-6, 12)
      ctx.stroke()
    }
  },

  transformer: {
    name: 'トランス',
    category: 'passive',
    width: 80,
    height: 80,
    pins: [
      { id: 'p1', x: 0, y: -20, label: '1' },
      { id: 'p2', x: 0, y: 20, label: '2' },
      { id: 's1', x: 80, y: -20, label: '3' },
      { id: 's2', x: 80, y: 20, label: '4' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Primary coil (left)
      ctx.beginPath()
      ctx.moveTo(0, -20)
      ctx.lineTo(15, -20)
      for (let i = 0; i < 4; i++) {
        ctx.arc(15, -20 + 5 + i * 10, 5, -Math.PI / 2, Math.PI / 2, false)
      }
      ctx.lineTo(0, 20)
      ctx.stroke()

      // Secondary coil (right)
      ctx.beginPath()
      ctx.moveTo(80, -20)
      ctx.lineTo(65, -20)
      for (let i = 0; i < 4; i++) {
        ctx.arc(65, -20 + 5 + i * 10, 5, Math.PI / 2, -Math.PI / 2, false)
      }
      ctx.lineTo(80, 20)
      ctx.stroke()

      // Core (two vertical lines)
      ctx.beginPath()
      ctx.moveTo(35, -25)
      ctx.lineTo(35, 25)
      ctx.moveTo(45, -25)
      ctx.lineTo(45, 25)
      ctx.stroke()
    }
  }
}

export function getComponentByType(type) {
  return componentLibrary[type]
}
