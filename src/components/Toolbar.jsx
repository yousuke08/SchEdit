import { useState, useEffect, useRef } from 'react'
import './Toolbar.css'
import useSchematicStore from '../store/schematicStore'
import { saveProjectToJSON, loadProjectFromJSON, exportToSVG, exportToPNG } from '../utils/fileOperations'
import { getComponentByType } from './componentLibrary'

function Toolbar({ showGrid, setShowGrid, canvasRef }) {
  const [zoom, setZoom] = useState(100)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const fileInputRef = useRef(null)
  const exportMenuRef = useRef(null)
  const { wires, components, addWire, addComponent } = useSchematicStore()

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

  const handleNew = () => {
    if (confirm('新規プロジェクトを作成しますか？現在の内容は失われます。')) {
      window.location.reload()
    }
  }

  const handleSave = () => {
    saveProjectToJSON(wires, components)
  }

  const handleLoad = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      loadProjectFromJSON(file, (project) => {
        // Clear current project
        useSchematicStore.setState({ wires: [], components: [] })

        // Load wires
        project.wires.forEach(wire => {
          addWire(wire)
        })

        // Load components
        project.components.forEach(comp => {
          addComponent(comp)
        })
      })
    }
    // Reset input
    e.target.value = ''
  }

  const handleExport = () => {
    setShowExportMenu(!showExportMenu)
  }

  const handleExportSVG = () => {
    exportToSVG(wires, components, getComponentByType)
    setShowExportMenu(false)
  }

  const handleExportPNG = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current.getCanvas?.()
      if (canvas) {
        exportToPNG(canvas)
      }
    }
    setShowExportMenu(false)
  }

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  return (
    <div className="toolbar">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div className="toolbar-section">
        <button onClick={handleNew} title="新規">新規</button>
        <button onClick={handleSave} title="保存">保存</button>
        <button onClick={handleLoad} title="読込">読込</button>
        <div className="export-dropdown" ref={exportMenuRef}>
          <button onClick={handleExport} title="エクスポート">エクスポート</button>
          {showExportMenu && (
            <div className="export-menu">
              <button onClick={handleExportSVG}>SVG形式</button>
              <button onClick={handleExportPNG}>PNG形式</button>
            </div>
          )}
        </div>
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
