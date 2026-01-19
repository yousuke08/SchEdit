import { useState, useEffect, useRef } from 'react'
import './Toolbar.css'
import useSchematicStore from '../store/schematicStore'
import { saveProjectToJSON, loadProjectFromJSON, exportToSVG, exportToPNG } from '../utils/fileOperations'
import { getComponentByType } from './componentLibrary'
import ExportOptionsDialog from './ExportOptionsDialog'

function Toolbar({ showGrid, setShowGrid, canvasRef }) {
  const [zoom, setZoom] = useState(100)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportType, setExportType] = useState(null)
  const fileInputRef = useRef(null)
  const exportMenuRef = useRef(null)
  const { wires, rectangles, components, addWire, addComponent, drawingMode, setDrawingMode, undo, redo, canUndo, canRedo } = useSchematicStore()

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
    saveProjectToJSON(wires, components, rectangles)
  }

  const handleLoad = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      loadProjectFromJSON(file, (project) => {
        // Clear current project
        useSchematicStore.setState({ wires: [], rectangles: [], components: [] })

        // Load wires
        project.wires.forEach(wire => {
          addWire(wire)
        })

        // Load rectangles
        if (project.rectangles) {
          project.rectangles.forEach(rect => {
            useSchematicStore.getState().addRectangle(rect)
          })
        }

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
    setExportType('svg')
    setShowExportDialog(true)
    setShowExportMenu(false)
  }

  const handleExportPNG = () => {
    setExportType('png')
    setShowExportDialog(true)
    setShowExportMenu(false)
  }

  const handleExportWithOptions = async (options) => {
    if (exportType === 'svg') {
      await exportToSVG(wires, rectangles, components, getComponentByType, options)
    } else if (exportType === 'png') {
      exportToPNG(wires, rectangles, components, getComponentByType, canvasRef, options)
    }
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
        <button onClick={undo} disabled={!canUndo()} title="元に戻す (Ctrl+Z)">Undo</button>
        <button onClick={redo} disabled={!canRedo()} title="やり直し (Ctrl+Y)">Redo</button>
      </div>
      <div className="toolbar-section">
        <button
          onClick={() => setDrawingMode('line')}
          disabled={drawingMode === 'line'}
          title="線の描画"
          style={{
            backgroundColor: drawingMode === 'line' ? '#4a9eff' : undefined,
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="3" y1="17" x2="17" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          onClick={() => setDrawingMode('rect')}
          disabled={drawingMode === 'rect'}
          title="四角の描画"
          style={{
            backgroundColor: drawingMode === 'rect' ? '#4a9eff' : undefined,
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        </button>
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
      <ExportOptionsDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExportWithOptions}
        exportType={exportType}
      />
    </div>
  )
}

export default Toolbar
