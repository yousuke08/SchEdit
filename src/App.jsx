import { useState, useRef } from 'react'
import './App.css'
import Toolbar from './components/Toolbar'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'

function App() {
  const [showGrid, setShowGrid] = useState(true)
  const canvasRef = useRef(null)

  return (
    <div className="app">
      <Toolbar
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        canvasRef={canvasRef}
      />
      <div className="main-container">
        <Sidebar position="left" title="部品">
          <p>部品パレット（後で実装）</p>
        </Sidebar>
        <Canvas ref={canvasRef} showGrid={showGrid} />
        <Sidebar position="right" title="プロパティ">
          <p>選択なし</p>
        </Sidebar>
      </div>
    </div>
  )
}

export default App
