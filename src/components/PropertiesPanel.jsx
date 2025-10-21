import { useState, useEffect } from 'react'
import useSchematicStore from '../store/schematicStore'
import './PropertiesPanel.css'

function PropertiesPanel() {
  const {
    selectedWireId,
    wires,
    wireColor,
    wireThickness,
    wireStyle,
    setWireColor,
    setWireThickness,
    setWireStyle,
    updateWire
  } = useSchematicStore()

  const selectedWire = wires.find(w => w.id === selectedWireId)

  const [localColor, setLocalColor] = useState(wireColor)
  const [localThickness, setLocalThickness] = useState(wireThickness)
  const [localStyle, setLocalStyle] = useState(wireStyle)

  useEffect(() => {
    if (selectedWire) {
      setLocalColor(selectedWire.color)
      setLocalThickness(selectedWire.thickness)
      setLocalStyle(selectedWire.style || 'solid')
    } else {
      setLocalColor(wireColor)
      setLocalThickness(wireThickness)
      setLocalStyle(wireStyle)
    }
  }, [selectedWire, wireColor, wireThickness, wireStyle])

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

  const handleStyleChange = (style) => {
    setLocalStyle(style)
    if (selectedWire) {
      updateWire(selectedWire.id, { style })
    } else {
      setWireStyle(style)
    }
  }

  const handleResetThickness = () => {
    if (selectedWire) {
      updateWire(selectedWire.id, { thickness: wireThickness })
      setLocalThickness(wireThickness)
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
          <div className="property-item">
            <label>線種:</label>
            <select value={localStyle} onChange={(e) => handleStyleChange(e.target.value)}>
              <option value="solid">実線</option>
              <option value="double">二重線</option>
              <option value="dashed">点線</option>
              <option value="dash-dot">1点鎖線</option>
              <option value="wavy">波線</option>
              <option value="double-wavy">2重波線</option>
            </select>
          </div>
        </div>
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
          <button className="reset-button" onClick={handleResetThickness} title="デフォルトに戻す">
            ↺
          </button>
        </div>
        <div className="property-item">
          <label>線種:</label>
          <select value={localStyle} onChange={(e) => handleStyleChange(e.target.value)}>
            <option value="solid">実線</option>
            <option value="double">二重線</option>
            <option value="dashed">点線</option>
            <option value="dash-dot">1点鎖線</option>
            <option value="wavy">波線</option>
            <option value="double-wavy">2重波線</option>
          </select>
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
