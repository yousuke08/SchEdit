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
      { id: 'p1', x: 0, y: 0, label: '+' },
      { id: 'p2', x: 60, y: 0, label: '-' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Draw JIS capacitor symbol (two parallel lines)
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
  }
}

export function getComponentByType(type) {
  return componentLibrary[type]
}
