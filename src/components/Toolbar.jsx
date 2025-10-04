import { useState, useEffect } from 'react'
import './Toolbar.css'

function Toolbar({ showGrid, setShowGrid, canvasRef }) {
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    const interval = setInterval(() => {
      if (canvasRef.current) {
        const currentZoom = canvasRef.current.getZoom()
        setZoom(Math.round(currentZoom * 100))
      }
    }, 100)

    return () => clearInterval(interval)
  }, [canvasRef])

  const handleZoomIn = () => {
    if (canvasRef.current) {
      canvasRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (canvasRef.current) {
      canvasRef.current.zoomOut()
    }
  }

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button title="新規">新規</button>
        <button title="保存">保存</button>
        <button title="読込">読込</button>
        <button title="エクスポート">エクスポート</button>
      </div>
      <div className="toolbar-section">
        <button title="元に戻す (Ctrl+Z)">Undo</button>
        <button title="やり直し (Ctrl+Y)">Redo</button>
      </div>
      <div className="toolbar-section">
        <label>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          グリッド表示
        </label>
        <button onClick={handleZoomIn} title="ズームイン">+</button>
        <button onClick={handleZoomOut} title="ズームアウト">-</button>
        <span className="zoom-level">{zoom}%</span>
      </div>
    </div>
  )
}

export default Toolbar
