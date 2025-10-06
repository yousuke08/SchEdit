import { useState, useRef, useEffect } from 'react'
import './App.css'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import PropertiesPanel from './components/PropertiesPanel'
import ComponentPalette from './components/ComponentPalette'
import useSchematicStore from './store/schematicStore'
import { saveToLocalStorage, loadFromLocalStorage } from './utils/fileOperations'

function App() {
  const [showGrid, setShowGrid] = useState(true)
  const canvasRef = useRef(null)
  const { wires, components } = useSchematicStore()

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromLocalStorage()
    if (saved && saved.wires && saved.components) {
      useSchematicStore.setState({
        wires: saved.wires,
        components: saved.components
      })
    }
  }, [])

  // Auto-save to localStorage on changes
  useEffect(() => {
    if (wires.length > 0 || components.length > 0) {
      saveToLocalStorage(wires, components)
    }
  }, [wires, components])

  return (
    <div className="app">
      <Toolbar
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        canvasRef={canvasRef}
      />
      <div className="main-container">
        <Sidebar position="left" title="部品">
          <ComponentPalette />
        </Sidebar>
        <Canvas ref={canvasRef} showGrid={showGrid} />
        <Sidebar position="right" title="プロパティ">
          <PropertiesPanel />
        </Sidebar>
      </div>
    </div>
  )
}

export default App
