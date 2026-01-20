import { useState, useEffect } from 'react'
import useSchematicStore from '../store/schematicStore'
import './PropertiesPanel.css'

function PropertiesPanel() {
  const {
    selectedWireId,
    wires,
    selectedRectId,
    rectangles,
    selectedTextBoxId,
    textBoxes,
    wireColor,
    wireThickness,
    wireStyle,
    setWireColor,
    setWireThickness,
    setWireStyle,
    updateWire,
    updateRectangle,
    updateTextBox
  } = useSchematicStore()

  const selectedWire = wires.find(w => w.id === selectedWireId)
  const selectedRect = rectangles.find(r => r.id === selectedRectId)
  const selectedTextBox = textBoxes.find(t => t.id === selectedTextBoxId)

  const [localColor, setLocalColor] = useState(wireColor)
  const [localThickness, setLocalThickness] = useState(wireThickness)
  const [localStyle, setLocalStyle] = useState(wireStyle)
  const [localFontSize, setLocalFontSize] = useState(16)

  useEffect(() => {
    if (selectedWire) {
      setLocalColor(selectedWire.color)
      setLocalThickness(selectedWire.thickness)
      setLocalStyle(selectedWire.style || 'solid')
    } else if (selectedRect) {
      setLocalColor(selectedRect.color)
      setLocalThickness(selectedRect.thickness)
      setLocalStyle(selectedRect.style || 'solid')
    } else if (selectedTextBox) {
      setLocalColor(selectedTextBox.color || '#ffffff')
      setLocalFontSize(selectedTextBox.fontSize || 16)
    } else {
      setLocalColor(wireColor)
      setLocalThickness(wireThickness)
      setLocalStyle(wireStyle)
    }
  }, [selectedWire, selectedRect, selectedTextBox, wireColor, wireThickness, wireStyle])

  const handleColorChange = (color) => {
    setLocalColor(color)
    if (selectedWire) {
      updateWire(selectedWire.id, { color })
    } else if (selectedRect) {
      updateRectangle(selectedRect.id, { color })
    } else if (selectedTextBox) {
      updateTextBox(selectedTextBox.id, { color })
    } else {
      setWireColor(color)
    }
  }

  const handleFontSizeChange = (fontSize) => {
    const value = parseInt(fontSize, 10)
    setLocalFontSize(value)
    if (selectedTextBox) {
      updateTextBox(selectedTextBox.id, { fontSize: value })
    }
  }

  const handleThicknessChange = (thickness) => {
    const value = parseInt(thickness, 10)
    setLocalThickness(value)
    if (selectedWire) {
      updateWire(selectedWire.id, { thickness: value })
    } else if (selectedRect) {
      updateRectangle(selectedRect.id, { thickness: value })
    } else {
      setWireThickness(value)
    }
  }

  const handleStyleChange = (style) => {
    setLocalStyle(style)
    if (selectedWire) {
      updateWire(selectedWire.id, { style })
    } else if (selectedRect) {
      updateRectangle(selectedRect.id, { style })
    } else {
      setWireStyle(style)
    }
  }

  const handleResetThickness = () => {
    if (selectedWire) {
      updateWire(selectedWire.id, { thickness: wireThickness })
      setLocalThickness(wireThickness)
    } else if (selectedRect) {
      updateRectangle(selectedRect.id, { thickness: wireThickness })
      setLocalThickness(wireThickness)
    }
  }

  if (!selectedWire && !selectedRect && !selectedTextBox) {
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

  if (selectedTextBox) {
    return (
      <div className="properties-panel">
        <div className="property-group">
          <h4>選択中のテキスト</h4>
          <div className="property-item">
            <label>色:</label>
            <input
              type="color"
              value={localColor}
              onChange={(e) => handleColorChange(e.target.value)}
            />
          </div>
          <div className="property-item">
            <label>フォントサイズ:</label>
            <input
              type="range"
              min="8"
              max="48"
              value={localFontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
            />
            <span>{localFontSize}px</span>
          </div>
          <div className="property-info">
            <p>位置: ({selectedTextBox.x}, {selectedTextBox.y})</p>
            <p>テキスト: {selectedTextBox.text.split('\n')[0]}{selectedTextBox.text.split('\n').length > 1 ? '...' : ''}</p>
          </div>
        </div>
      </div>
    )
  }

  if (selectedRect) {
    const minX = Math.min(selectedRect.start.x, selectedRect.end.x)
    const maxX = Math.max(selectedRect.start.x, selectedRect.end.x)
    const minY = Math.min(selectedRect.start.y, selectedRect.end.y)
    const maxY = Math.max(selectedRect.start.y, selectedRect.end.y)
    const width = maxX - minX
    const height = maxY - minY

    return (
      <div className="properties-panel">
        <div className="property-group">
          <h4>選択中の四角形</h4>
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
              <option value="dashed">点線</option>
              <option value="dash-dot">1点鎖線</option>
            </select>
          </div>
          <div className="property-info">
            <p>位置: ({minX}, {minY})</p>
            <p>サイズ: {width} × {height}</p>
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
