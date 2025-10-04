// Component library with basic power electronics components

export const componentLibrary = {
  resistor: {
    name: '抵抗',
    category: 'passive',
    width: 60,
    height: 20,
    pins: [
      { id: 'p1', x: -30, y: 0, label: '1' },
      { id: 'p2', x: 30, y: 0, label: '2' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2
      ctx.fillStyle = 'transparent'

      // Draw resistor symbol
      ctx.beginPath()
      ctx.moveTo(-30, 0)
      ctx.lineTo(-20, 0)
      const zigzag = [
        [-20, 0], [-17, -7], [-11, 7], [-5, -7], [1, 7], [7, -7], [13, 7], [17, -7], [20, 0]
      ]
      zigzag.forEach(([x, y]) => ctx.lineTo(x, y))
      ctx.lineTo(30, 0)
      ctx.stroke()
    }
  },

  capacitor: {
    name: 'コンデンサ',
    category: 'passive',
    width: 40,
    height: 40,
    pins: [
      { id: 'p1', x: -20, y: 0, label: '+' },
      { id: 'p2', x: 20, y: 0, label: '-' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Draw capacitor symbol
      ctx.beginPath()
      ctx.moveTo(-20, 0)
      ctx.lineTo(-5, 0)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-5, -15)
      ctx.lineTo(-5, 15)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(5, -15)
      ctx.lineTo(5, 15)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(5, 0)
      ctx.lineTo(20, 0)
      ctx.stroke()
    }
  },

  inductor: {
    name: 'インダクタ',
    category: 'passive',
    width: 60,
    height: 30,
    pins: [
      { id: 'p1', x: -30, y: 0, label: '1' },
      { id: 'p2', x: 30, y: 0, label: '2' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2
      ctx.fillStyle = 'transparent'

      // Draw inductor symbol (coils)
      ctx.beginPath()
      ctx.moveTo(-30, 0)
      ctx.lineTo(-20, 0)

      for (let i = 0; i < 4; i++) {
        const x = -20 + i * 10
        ctx.arc(x + 5, 0, 5, Math.PI, 0, false)
      }

      ctx.lineTo(30, 0)
      ctx.stroke()
    }
  },

  diode: {
    name: 'ダイオード',
    category: 'semiconductor',
    width: 40,
    height: 30,
    pins: [
      { id: 'anode', x: -20, y: 0, label: 'A' },
      { id: 'cathode', x: 20, y: 0, label: 'K' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.fillStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Draw diode symbol
      ctx.beginPath()
      ctx.moveTo(-20, 0)
      ctx.lineTo(-5, 0)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-5, -10)
      ctx.lineTo(-5, 10)
      ctx.lineTo(5, 0)
      ctx.closePath()
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(5, -10)
      ctx.lineTo(5, 10)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(5, 0)
      ctx.lineTo(20, 0)
      ctx.stroke()
    }
  },

  mosfet_n: {
    name: 'N-ch MOSFET',
    category: 'semiconductor',
    width: 50,
    height: 50,
    pins: [
      { id: 'gate', x: -25, y: 0, label: 'G' },
      { id: 'drain', x: 10, y: -25, label: 'D' },
      { id: 'source', x: 10, y: 25, label: 'S' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Gate
      ctx.beginPath()
      ctx.moveTo(-25, 0)
      ctx.lineTo(-10, 0)
      ctx.stroke()

      // Gate line
      ctx.beginPath()
      ctx.moveTo(-10, -15)
      ctx.lineTo(-10, 15)
      ctx.stroke()

      // Channel
      ctx.beginPath()
      ctx.moveTo(-3, -15)
      ctx.lineTo(-3, -5)
      ctx.moveTo(-3, -2)
      ctx.lineTo(-3, 2)
      ctx.moveTo(-3, 5)
      ctx.lineTo(-3, 15)
      ctx.stroke()

      // Drain
      ctx.beginPath()
      ctx.moveTo(-3, -10)
      ctx.lineTo(10, -10)
      ctx.lineTo(10, -25)
      ctx.stroke()

      // Source
      ctx.beginPath()
      ctx.moveTo(-3, 10)
      ctx.lineTo(10, 10)
      ctx.lineTo(10, 25)
      ctx.stroke()

      // Body diode (optional)
      ctx.beginPath()
      ctx.arc(0, 0, 20, 0, Math.PI * 2)
      ctx.stroke()
    }
  },

  gnd: {
    name: 'GND',
    category: 'symbol',
    width: 30,
    height: 30,
    pins: [
      { id: 'p1', x: 0, y: -15, label: '' }
    ],
    render: (ctx, selected) => {
      ctx.strokeStyle = selected ? '#ffff00' : '#ffffff'
      ctx.lineWidth = 2

      // Draw GND symbol
      ctx.beginPath()
      ctx.moveTo(0, -15)
      ctx.lineTo(0, 0)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-12, 0)
      ctx.lineTo(12, 0)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-8, 5)
      ctx.lineTo(8, 5)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-4, 10)
      ctx.lineTo(4, 10)
      ctx.stroke()
    }
  }
}

export function getComponentByType(type) {
  return componentLibrary[type]
}
