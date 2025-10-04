import { useState, useEffect } from 'react'
import useSchematicStore from '../store/schematicStore'
import './PropertiesPanel.css'

function PropertiesPanel() {
  const {
    selectedWireId,
    wires,
    wireColor,
    wireThickness,
    setWireColor,
    setWireThickness,
    updateWire
  } = useSchematicStore()

  const selectedWire = wires.find(w => w.id === selectedWireId)

  const [localColor, setLocalColor] = useState(wireColor)
  const [localThickness, setLocalThickness] = useState(wireThickness)

  useEffect(() => {
    if (selectedWire) {
      setLocalColor(selectedWire.color)
      setLocalThickness(selectedWire.thickness)
    } else {
      setLocalColor(wireColor)
      setLocalThickness(wireThickness)
    }
  }, [selectedWire, wireColor, wireThickness])

  const handleColorChange = (color) => {
    setLocalColor(color)
    if (selectedWire) {
      updateWire(selectedWire.id, { color })
    } else {
      setWireColor(color)
    }
  }

  const handleThicknessChange = (thickness) => {
    const value = parseInt(thickness, 10)
    setLocalThickness(value)
    if (selectedWire) {
      updateWire(selectedWire.id, { thickness: value })
    } else {
      setWireThickness(value)
    }
  }

  if (!selectedWire) {
    return (
      <div className="properties-panel">
        <div className="property-group">
          <h4>配線設定</h4>
          <div className="property-item">
            <label>色:</label>
            <input
              type="color"
              value={localColor}
              onChange={(e) => handleColorChange(e.target.value)}
            />
          </div>
          <div className="property-item">
            <label>太さ:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={localThickness}
              onChange={(e) => handleThicknessChange(e.target.value)}
            />
            <span>{localThickness}px</span>
          </div>
        </div>
        <p className="hint">配線を選択すると、個別の設定が可能です</p>
      </div>
    )
  }

  return (
    <div className="properties-panel">
      <div className="property-group">
        <h4>選択中の配線</h4>
        <div className="property-item">
          <label>色:</label>
          <input
            type="color"
            value={localColor}
            onChange={(e) => handleColorChange(e.target.value)}
          />
        </div>
        <div className="property-item">
          <label>太さ:</label>
          <input
            type="range"
            min="1"
            max="10"
            value={localThickness}
            onChange={(e) => handleThicknessChange(e.target.value)}
          />
          <span>{localThickness}px</span>
        </div>
        <div className="property-info">
          <p>開始点: ({selectedWire.start.x}, {selectedWire.start.y})</p>
          <p>終了点: ({selectedWire.end.x}, {selectedWire.end.y})</p>
        </div>
      </div>
    </div>
  )
}

export default PropertiesPanel
