import { useState } from 'react'
import { componentLibrary } from './componentLibrary'
import './ComponentPalette.css'

function ComponentPalette() {
  const [selectedType, setSelectedType] = useState(null)

  const categories = {
    passive: { name: '受動部品', components: ['resistor', 'resistor_us', 'capacitor', 'capacitor_electrolytic', 'inductor', 'inductor_coil', 'transformer'] },
    semiconductor: { name: '半導体', components: [] },
    source: { name: '電源', components: ['voltage_source', 'current_source'] },
    symbol: { name: '記号', components: ['gnd'] }
  }

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('componentType', type)
    setSelectedType(type)
  }

  const handleDragEnd = () => {
    setSelectedType(null)
  }

  return (
    <div className="component-palette">
      {Object.entries(categories).map(([catKey, category]) => (
        <div key={catKey} className="component-category">
          <h4>{category.name}</h4>
          <div className="component-list">
            {category.components.map(type => {
              const component = componentLibrary[type]
              return (
                <div
                  key={type}
                  className={`component-item ${selectedType === type ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, type)}
                  onDragEnd={handleDragEnd}
                  title={component.name}
                >
                  <canvas
                    ref={(canvas) => {
                      if (canvas && component) {
                        const ctx = canvas.getContext('2d')
                        canvas.width = 80
                        canvas.height = 60
                        ctx.clearRect(0, 0, 80, 60)
                        ctx.save()

                        // Calculate bounding box from pins
                        const pins = component.pins || []
                        if (pins.length > 0) {
                          const xs = pins.map(p => p.x)
                          const ys = pins.map(p => p.y)
                          const minX = Math.min(...xs)
                          const maxX = Math.max(...xs)
                          const minY = Math.min(...ys)
                          const maxY = Math.max(...ys)
                          const centerX = (minX + maxX) / 2
                          const centerY = (minY + maxY) / 2

                          // Center on canvas
                          ctx.translate(40, 30)
                          ctx.scale(0.8, 0.8)
                          ctx.translate(-centerX, -centerY)
                        } else {
                          // Fallback: use component width/height
                          ctx.translate(40, 30)
                          ctx.scale(0.8, 0.8)
                          ctx.translate(-component.width / 2, -component.height / 2)
                        }

                        component.render(ctx, false)
                        ctx.restore()
                      }
                    }}
                  />
                  <span>{component.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ComponentPalette
