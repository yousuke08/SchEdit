import { useState } from 'react'
import './App.css'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'

function App() {
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(1.0)

  return (
    <div className="app">
      <Toolbar
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        zoom={zoom}
        setZoom={setZoom}
      />
      <div className="main-container">
        <Sidebar position="left" title="部品">
          <p>部品パレット（後で実装）</p>
        </Sidebar>
        <Canvas showGrid={showGrid} zoom={zoom} />
        <Sidebar position="right" title="プロパティ">
          <p>選択なし</p>
        </Sidebar>
      </div>
    </div>
  )
}

export default App
