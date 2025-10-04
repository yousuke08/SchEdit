import './Toolbar.css'

function Toolbar({ showGrid, setShowGrid, zoom, setZoom }) {
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3.0))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.1))
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
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  )
}

export default Toolbar
