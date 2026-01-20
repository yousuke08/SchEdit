import { useState, useEffect, useRef } from 'react'
import './TextEditDialog.css'

function TextEditDialog({ isOpen, onClose, onSave, initialText = '', editingId = null }) {
  const [text, setText] = useState(initialText)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setText(initialText)
      // Focus textarea when dialog opens
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }, [isOpen, initialText])

  if (!isOpen) return null

  const handleSave = () => {
    if (text.trim()) {
      onSave(text, editingId)
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave()
    }
  }

  const stopEvent = (e) => e.stopPropagation()

  return (
    <div className="dialog-overlay" onClick={onClose} onDoubleClick={stopEvent} onMouseDown={stopEvent}>
      <div className="dialog-content" onClick={stopEvent} onDoubleClick={stopEvent} onMouseDown={stopEvent}>
        <h3>テキストを入力</h3>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="テキストを入力..."
          rows={5}
        />
        <div className="dialog-actions">
          <button onClick={onClose}>キャンセル</button>
          <button onClick={handleSave} disabled={!text.trim()}>
            OK
          </button>
        </div>
        <div className="dialog-hint">
          Ctrl+Enter で保存 / Esc でキャンセル
        </div>
      </div>
    </div>
  )
}

export default TextEditDialog
