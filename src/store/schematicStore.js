import { create } from 'zustand'

const MAX_HISTORY = 50

const useSchematicStore = create((set, get) => ({
  wires: [],
  rectangles: [],
  textBoxes: [],
  components: [],
  selectedWireId: null,
  selectedRectId: null,
  selectedTextBoxId: null,
  selectedComponentId: null,
  selectedWireIds: [],
  selectedRectIds: [],
  selectedTextBoxIds: [],
  selectedComponentIds: [],
  wireColor: '#ffffff',
  wireThickness: 2,
  wireStyle: 'solid', // 'solid', 'double', 'dashed', 'dash-dot', 'wavy', 'double-wavy'
  // Arrow settings: type = 'none' | 'triangle' | 'circle', fill = 'wire' | 'black' | 'white', inward = boolean
  wireArrowStart: { type: 'none', fill: 'wire', inward: false },
  wireArrowEnd: { type: 'none', fill: 'wire', inward: false },
  drawingMode: 'line', // 'line' or 'rect'
  clipboard: { components: [], wires: [], rectangles: [], textBoxes: [] },
  history: [],
  historyIndex: -1,

  // Save current state to history
  saveToHistory: () => {
    const state = get()
    const snapshot = {
      wires: JSON.parse(JSON.stringify(state.wires)),
      rectangles: JSON.parse(JSON.stringify(state.rectangles)),
      textBoxes: JSON.parse(JSON.stringify(state.textBoxes)),
      components: JSON.parse(JSON.stringify(state.components))
    }

    // Remove any redo history when a new action is performed
    const newHistory = state.history.slice(0, state.historyIndex + 1)
    newHistory.push(snapshot)

    // Limit history size
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift()
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1
    })
  },

  // Undo action
  undo: () => {
    const state = get()
    if (state.historyIndex <= 0) return

    const newIndex = state.historyIndex - 1
    const snapshot = state.history[newIndex]

    set({
      wires: JSON.parse(JSON.stringify(snapshot.wires)),
      rectangles: JSON.parse(JSON.stringify(snapshot.rectangles)),
      textBoxes: JSON.parse(JSON.stringify(snapshot.textBoxes)),
      components: JSON.parse(JSON.stringify(snapshot.components)),
      historyIndex: newIndex,
      selectedWireId: null,
      selectedRectId: null,
      selectedTextBoxId: null,
      selectedComponentId: null,
      selectedWireIds: [],
      selectedRectIds: [],
      selectedTextBoxIds: [],
      selectedComponentIds: []
    })
  },

  // Redo action
  redo: () => {
    const state = get()
    if (state.historyIndex >= state.history.length - 1) return

    const newIndex = state.historyIndex + 1
    const snapshot = state.history[newIndex]

    set({
      wires: JSON.parse(JSON.stringify(snapshot.wires)),
      rectangles: JSON.parse(JSON.stringify(snapshot.rectangles)),
      textBoxes: JSON.parse(JSON.stringify(snapshot.textBoxes)),
      components: JSON.parse(JSON.stringify(snapshot.components)),
      historyIndex: newIndex,
      selectedWireId: null,
      selectedRectId: null,
      selectedTextBoxId: null,
      selectedComponentId: null,
      selectedWireIds: [],
      selectedRectIds: [],
      selectedTextBoxIds: [],
      selectedComponentIds: []
    })
  },

  canUndo: () => {
    const state = get()
    return state.historyIndex > 0
  },

  canRedo: () => {
    const state = get()
    return state.historyIndex < state.history.length - 1
  },

  addWire: (wire) => {
    set((state) => ({
      wires: [...state.wires, { ...wire, id: crypto.randomUUID() }]
    }))
    get().saveToHistory()
  },

  removeWire: (id) => {
    set((state) => ({
      wires: state.wires.filter(w => w.id !== id),
      selectedWireId: state.selectedWireId === id ? null : state.selectedWireId
    }))
    get().saveToHistory()
  },

  updateWire: (id, updates) => {
    set((state) => ({
      wires: state.wires.map(w => w.id === id ? { ...w, ...updates } : w)
    }))
    get().saveToHistory()
  },

  updateWireWithoutHistory: (id, updates) => {
    set((state) => ({
      wires: state.wires.map(w => w.id === id ? { ...w, ...updates } : w)
    }))
  },

  setSelectedWire: (id) => set({ selectedWireId: id, selectedComponentId: null }),

  setWireColor: (color) => set({ wireColor: color }),

  setWireThickness: (thickness) => set({ wireThickness: thickness }),

  setWireStyle: (style) => set({ wireStyle: style }),

  setWireArrowStart: (arrowStart) => set({ wireArrowStart: arrowStart }),

  setWireArrowEnd: (arrowEnd) => set({ wireArrowEnd: arrowEnd }),

  addRectangle: (rect) => {
    set((state) => ({
      rectangles: [...state.rectangles, { ...rect, id: crypto.randomUUID() }]
    }))
    get().saveToHistory()
  },

  removeRectangle: (id) => {
    set((state) => ({
      rectangles: state.rectangles.filter(r => r.id !== id),
      selectedRectId: state.selectedRectId === id ? null : state.selectedRectId
    }))
    get().saveToHistory()
  },

  updateRectangle: (id, updates) => {
    set((state) => ({
      rectangles: state.rectangles.map(r => r.id === id ? { ...r, ...updates } : r)
    }))
    get().saveToHistory()
  },

  updateRectangleWithoutHistory: (id, updates) => {
    set((state) => ({
      rectangles: state.rectangles.map(r => r.id === id ? { ...r, ...updates } : r)
    }))
  },

  setSelectedRect: (id) => set({ selectedRectId: id, selectedWireId: null, selectedComponentId: null }),

  setDrawingMode: (mode) => set({ drawingMode: mode }),

  addTextBox: (textBox) => {
    set((state) => ({
      textBoxes: [...state.textBoxes, {
        ...textBox,
        id: crypto.randomUUID(),
        textAlign: textBox.textAlign || 'left',
        verticalAlign: textBox.verticalAlign || 'top',
        width: textBox.width || null,
        height: textBox.height || null
      }]
    }))
    get().saveToHistory()
  },

  removeTextBox: (id) => {
    set((state) => ({
      textBoxes: state.textBoxes.filter(t => t.id !== id),
      selectedTextBoxId: state.selectedTextBoxId === id ? null : state.selectedTextBoxId
    }))
    get().saveToHistory()
  },

  updateTextBox: (id, updates) => {
    set((state) => ({
      textBoxes: state.textBoxes.map(t => t.id === id ? { ...t, ...updates } : t)
    }))
    get().saveToHistory()
  },

  updateTextBoxWithoutHistory: (id, updates) => {
    set((state) => ({
      textBoxes: state.textBoxes.map(t => t.id === id ? { ...t, ...updates } : t)
    }))
  },

  setSelectedTextBox: (id) => set({ selectedTextBoxId: id, selectedWireId: null, selectedRectId: null, selectedComponentId: null }),

  addComponent: (component) => {
    set((state) => ({
      components: [...state.components, { ...component, id: crypto.randomUUID() }]
    }))
    get().saveToHistory()
  },

  removeComponent: (id) => {
    set((state) => ({
      components: state.components.filter(c => c.id !== id),
      selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId
    }))
    get().saveToHistory()
  },

  updateComponent: (id, updates) => {
    set((state) => ({
      components: state.components.map(c => c.id === id ? { ...c, ...updates } : c)
    }))
    get().saveToHistory()
  },

  updateComponentWithoutHistory: (id, updates) => {
    set((state) => ({
      components: state.components.map(c => c.id === id ? { ...c, ...updates } : c)
    }))
  },

  setSelectedComponent: (id) => set({ selectedComponentId: id, selectedWireId: null, selectedRectId: null, selectedTextBoxId: null }),

  clearSelection: () => set({ selectedWireId: null, selectedRectId: null, selectedTextBoxId: null, selectedComponentId: null, selectedWireIds: [], selectedRectIds: [], selectedTextBoxIds: [], selectedComponentIds: [] }),

  setMultipleSelection: (wireIds, rectIds, textBoxIds, componentIds) => set({
    selectedWireIds: wireIds,
    selectedRectIds: rectIds,
    selectedTextBoxIds: textBoxIds,
    selectedComponentIds: componentIds,
    selectedWireId: null,
    selectedRectId: null,
    selectedTextBoxId: null,
    selectedComponentId: null
  }),

  addToSelection: (wireId, rectId, textBoxId, componentId) => set((state) => ({
    selectedWireIds: wireId && !state.selectedWireIds.includes(wireId)
      ? [...state.selectedWireIds, wireId]
      : state.selectedWireIds,
    selectedRectIds: rectId && !state.selectedRectIds.includes(rectId)
      ? [...state.selectedRectIds, rectId]
      : state.selectedRectIds,
    selectedTextBoxIds: textBoxId && !state.selectedTextBoxIds.includes(textBoxId)
      ? [...state.selectedTextBoxIds, textBoxId]
      : state.selectedTextBoxIds,
    selectedComponentIds: componentId && !state.selectedComponentIds.includes(componentId)
      ? [...state.selectedComponentIds, componentId]
      : state.selectedComponentIds
  })),

  copyToClipboard: (components, wires, rectangles, textBoxes) => set({
    clipboard: { components, wires, rectangles, textBoxes }
  }),

  pasteFromClipboard: () => {
    set((state) => {
      const newComponents = state.clipboard.components.map(comp => ({
        ...comp,
        id: crypto.randomUUID(),
        x: comp.x + 20,
        y: comp.y + 20
      }))
      const newWires = state.clipboard.wires.map(wire => ({
        ...wire,
        id: crypto.randomUUID(),
        start: { x: wire.start.x + 20, y: wire.start.y + 20 },
        end: { x: wire.end.x + 20, y: wire.end.y + 20 }
      }))
      const newRectangles = state.clipboard.rectangles.map(rect => ({
        ...rect,
        id: crypto.randomUUID(),
        start: { x: rect.start.x + 20, y: rect.start.y + 20 },
        end: { x: rect.end.x + 20, y: rect.end.y + 20 }
      }))
      const newTextBoxes = state.clipboard.textBoxes.map(textBox => ({
        ...textBox,
        id: crypto.randomUUID(),
        x: textBox.x + 20,
        y: textBox.y + 20
      }))
      return {
        components: [...state.components, ...newComponents],
        wires: [...state.wires, ...newWires],
        rectangles: [...state.rectangles, ...newRectangles],
        textBoxes: [...state.textBoxes, ...newTextBoxes],
        selectedComponentIds: newComponents.map(c => c.id),
        selectedWireIds: newWires.map(w => w.id),
        selectedRectIds: newRectangles.map(r => r.id),
        selectedTextBoxIds: newTextBoxes.map(t => t.id),
        selectedComponentId: null,
        selectedWireId: null,
        selectedRectId: null,
        selectedTextBoxId: null
      }
    })
    get().saveToHistory()
  }
}))

export default useSchematicStore
