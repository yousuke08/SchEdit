import { useState } from 'react'
import './ExportOptionsDialog.css'

function ExportOptionsDialog({ isOpen, onClose, onExport, exportType }) {
  const [options, setOptions] = useState({
    useWireColor: false,
    wireColor: '#00ff00',
    backgroundColor: '#1a1a1a',
    transparentBackground: false,
    showGrid: false
  })

  if (!isOpen) return null

  const handleExport = () => {
    onExport(options)
    onClose()
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <h3>{exportType === 'svg' ? 'SVG' : 'PNG'}エクスポート設定</h3>

        <div className="dialog-option">
          <label>
            <input
              type="checkbox"
              checked={options.useWireColor}
              onChange={(e) => setOptions({ ...options, useWireColor: e.target.checked })}
            />
            線色を一括指定
          </label>
        </div>

        <div className="dialog-option">
          <label>線色:</label>
          <input
            type="color"
            value={options.wireColor}
            onChange={(e) => setOptions({ ...options, wireColor: e.target.value })}
            disabled={!options.useWireColor}
          />
          <span>{options.wireColor}</span>
        </div>

        <div className="dialog-option">
          <label>背景色:</label>
          <input
            type="color"
            value={options.backgroundColor}
            onChange={(e) => setOptions({ ...options, backgroundColor: e.target.value })}
            disabled={options.transparentBackground}
          />
          <span>{options.backgroundColor}</span>
        </div>

        <div className="dialog-option">
          <label>
            <input
              type="checkbox"
              checked={options.transparentBackground}
              onChange={(e) => setOptions({ ...options, transparentBackground: e.target.checked })}
            />
            背景を透明に
          </label>
        </div>

        <div className="dialog-option">
          <label>
            <input
              type="checkbox"
              checked={options.showGrid}
              onChange={(e) => setOptions({ ...options, showGrid: e.target.checked })}
            />
            グリッドを表示
          </label>
        </div>

        <div className="dialog-buttons">
          <button onClick={handleExport} className="btn-primary">エクスポート</button>
          <button onClick={onClose} className="btn-secondary">キャンセル</button>
        </div>
      </div>
    </div>
  )
}

export default ExportOptionsDialog
