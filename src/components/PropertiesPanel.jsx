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
    wireArrowStart,
    wireArrowEnd,
    setWireColor,
    setWireThickness,
    setWireStyle,
    setWireArrowStart,
    setWireArrowEnd,
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
  const [localArrowStart, setLocalArrowStart] = useState(wireArrowStart)
  const [localArrowEnd, setLocalArrowEnd] = useState(wireArrowEnd)
  const [localTextAlign, setLocalTextAlign] = useState('left')
  const [localVerticalAlign, setLocalVerticalAlign] = useState('top')

  const defaultArrow = { type: 'none', fill: 'wire', inward: false }

  useEffect(() => {
    if (selectedWire) {
      setLocalColor(selectedWire.color)
      setLocalThickness(selectedWire.thickness)
      setLocalStyle(selectedWire.style || 'solid')
      setLocalArrowStart(selectedWire.arrowStart || defaultArrow)
      setLocalArrowEnd(selectedWire.arrowEnd || defaultArrow)
    } else if (selectedRect) {
      setLocalColor(selectedRect.color)
      setLocalThickness(selectedRect.thickness)
      setLocalStyle(selectedRect.style || 'solid')
    } else if (selectedTextBox) {
      setLocalColor(selectedTextBox.color || '#ffffff')
      setLocalFontSize(selectedTextBox.fontSize || 16)
      setLocalTextAlign(selectedTextBox.textAlign || 'left')
      setLocalVerticalAlign(selectedTextBox.verticalAlign || 'top')
    } else {
      setLocalColor(wireColor)
      setLocalThickness(wireThickness)
      setLocalStyle(wireStyle)
      setLocalArrowStart(wireArrowStart)
      setLocalArrowEnd(wireArrowEnd)
    }
  }, [selectedWire, selectedRect, selectedTextBox, wireColor, wireThickness, wireStyle, wireArrowStart, wireArrowEnd])

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

  const handleTextAlignChange = (textAlign) => {
    setLocalTextAlign(textAlign)
    if (selectedTextBox) {
      updateTextBox(selectedTextBox.id, { textAlign })
    }
  }

  const handleVerticalAlignChange = (verticalAlign) => {
    setLocalVerticalAlign(verticalAlign)
    if (selectedTextBox) {
      updateTextBox(selectedTextBox.id, { verticalAlign })
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

  const handleArrowStartChange = (key, value) => {
    const newArrow = { ...localArrowStart, [key]: value }
    setLocalArrowStart(newArrow)
    if (selectedWire) {
      updateWire(selectedWire.id, { arrowStart: newArrow })
    } else {
      setWireArrowStart(newArrow)
    }
  }

  const handleArrowEndChange = (key, value) => {
    const newArrow = { ...localArrowEnd, [key]: value }
    setLocalArrowEnd(newArrow)
    if (selectedWire) {
      updateWire(selectedWire.id, { arrowEnd: newArrow })
    } else {
      setWireArrowEnd(newArrow)
    }
  }

  // Arrow settings UI component
  const ArrowSettings = ({ label, arrow, onChange }) => (
    <div className="arrow-settings">
      <label className="arrow-label">{label}</label>
      <div className="arrow-row">
        <label>形状:</label>
        <select value={arrow.type} onChange={(e) => onChange('type', e.target.value)}>
          <option value="none">なし</option>
          <option value="triangle">三角</option>
          <option value="circle">丸</option>
        </select>
      </div>
      {arrow.type !== 'none' && (
        <>
          <div className="arrow-row">
            <label>塗り:</label>
            <select value={arrow.fill} onChange={(e) => onChange('fill', e.target.value)}>
              <option value="wire">線のみ</option>
              <option value="hollow">中抜き</option>
              <option value="filled">中塗り</option>
            </select>
          </div>
          <div className="arrow-row">
            <label>向き:</label>
            <select value={arrow.inward ? 'inward' : 'outward'} onChange={(e) => onChange('inward', e.target.value === 'inward')}>
              <option value="outward">外向き</option>
              <option value="inward">内向き</option>
            </select>
          </div>
        </>
      )}
    </div>
  )

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
          <ArrowSettings label="始点矢印:" arrow={localArrowStart} onChange={handleArrowStartChange} />
          <ArrowSettings label="終点矢印:" arrow={localArrowEnd} onChange={handleArrowEndChange} />
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
          <div className="property-item">
            <label>横配置:</label>
            <div className="align-buttons">
              <button
                className={`align-btn ${localTextAlign === 'left' ? 'active' : ''}`}
                onClick={() => handleTextAlignChange('left')}
                title="左寄せ"
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <rect x="2" y="3" width="10" height="2" fill="currentColor"/>
                  <rect x="2" y="7" width="8" height="2" fill="currentColor"/>
                  <rect x="2" y="11" width="12" height="2" fill="currentColor"/>
                </svg>
              </button>
              <button
                className={`align-btn ${localTextAlign === 'center' ? 'active' : ''}`}
                onClick={() => handleTextAlignChange('center')}
                title="中央揃え"
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <rect x="3" y="3" width="10" height="2" fill="currentColor"/>
                  <rect x="4" y="7" width="8" height="2" fill="currentColor"/>
                  <rect x="2" y="11" width="12" height="2" fill="currentColor"/>
                </svg>
              </button>
              <button
                className={`align-btn ${localTextAlign === 'right' ? 'active' : ''}`}
                onClick={() => handleTextAlignChange('right')}
                title="右寄せ"
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <rect x="4" y="3" width="10" height="2" fill="currentColor"/>
                  <rect x="6" y="7" width="8" height="2" fill="currentColor"/>
                  <rect x="2" y="11" width="12" height="2" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="property-item">
            <label>縦配置:</label>
            <div className="align-buttons">
              <button
                className={`align-btn ${localVerticalAlign === 'top' ? 'active' : ''}`}
                onClick={() => handleVerticalAlignChange('top')}
                title="上寄せ"
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <rect x="2" y="2" width="12" height="2" fill="currentColor"/>
                  <rect x="6" y="5" width="4" height="9" fill="currentColor" opacity="0.5"/>
                </svg>
              </button>
              <button
                className={`align-btn ${localVerticalAlign === 'middle' ? 'active' : ''}`}
                onClick={() => handleVerticalAlignChange('middle')}
                title="中央揃え"
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <rect x="2" y="7" width="12" height="2" fill="currentColor"/>
                  <rect x="6" y="3" width="4" height="10" fill="currentColor" opacity="0.5"/>
                </svg>
              </button>
              <button
                className={`align-btn ${localVerticalAlign === 'bottom' ? 'active' : ''}`}
                onClick={() => handleVerticalAlignChange('bottom')}
                title="下寄せ"
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <rect x="2" y="12" width="12" height="2" fill="currentColor"/>
                  <rect x="6" y="2" width="4" height="9" fill="currentColor" opacity="0.5"/>
                </svg>
              </button>
            </div>
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
        <ArrowSettings label="始点矢印:" arrow={localArrowStart} onChange={handleArrowStartChange} />
        <ArrowSettings label="終点矢印:" arrow={localArrowEnd} onChange={handleArrowEndChange} />
        <div className="property-info">
          <p>開始点: ({selectedWire.start.x}, {selectedWire.start.y})</p>
          <p>終了点: ({selectedWire.end.x}, {selectedWire.end.y})</p>
        </div>
      </div>
    </div>
  )
}

export default PropertiesPanel
