import { create } from 'zustand'

const MAX_HISTORY = 50

const useSchematicStore = create((set, get) => ({
  wires: [],
  rectangles: [],
  components: [],
  selectedWireId: null,
  selectedRectId: null,
  selectedComponentId: null,
  selectedWireIds: [],
  selectedRectIds: [],
  selectedComponentIds: [],
  wireColor: '#ffffff',
  wireThickness: 2,
  wireStyle: 'solid', // 'solid', 'double', 'dashed', 'dash-dot', 'wavy', 'double-wavy'
  drawingMode: 'line', // 'line' or 'rect'
  clipboard: { components: [], wires: [], rectangles: [] },
  history: [],
  historyIndex: -1,

  // Save current state to history
  saveToHistory: () => {
    const state = get()
    const snapshot = {
      wires: JSON.parse(JSON.stringify(state.wires)),
      rectangles: JSON.parse(JSON.stringify(state.rectangles)),
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
      components: JSON.parse(JSON.stringify(snapshot.components)),
      historyIndex: newIndex,
      selectedWireId: null,
      selectedRectId: null,
      selectedComponentId: null,
      selectedWireIds: [],
      selectedRectIds: [],
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
      components: JSON.parse(JSON.stringify(snapshot.components)),
      historyIndex: newIndex,
      selectedWireId: null,
      selectedRectId: null,
      selectedComponentId: null,
      selectedWireIds: [],
      selectedRectIds: [],
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

  setSelectedComponent: (id) => set({ selectedComponentId: id, selectedWireId: null, selectedRectId: null }),

  clearSelection: () => set({ selectedWireId: null, selectedRectId: null, selectedComponentId: null, selectedWireIds: [], selectedRectIds: [], selectedComponentIds: [] }),

  setMultipleSelection: (wireIds, rectIds, componentIds) => set({
    selectedWireIds: wireIds,
    selectedRectIds: rectIds,
    selectedComponentIds: componentIds,
    selectedWireId: null,
    selectedRectId: null,
    selectedComponentId: null
  }),

  addToSelection: (wireId, rectId, componentId) => set((state) => ({
    selectedWireIds: wireId && !state.selectedWireIds.includes(wireId)
      ? [...state.selectedWireIds, wireId]
      : state.selectedWireIds,
    selectedRectIds: rectId && !state.selectedRectIds.includes(rectId)
      ? [...state.selectedRectIds, rectId]
      : state.selectedRectIds,
    selectedComponentIds: componentId && !state.selectedComponentIds.includes(componentId)
      ? [...state.selectedComponentIds, componentId]
      : state.selectedComponentIds
  })),

  copyToClipboard: (components, wires, rectangles) => set({
    clipboard: { components, wires, rectangles }
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
      return {
        components: [...state.components, ...newComponents],
        wires: [...state.wires, ...newWires],
        rectangles: [...state.rectangles, ...newRectangles],
        selectedComponentIds: newComponents.map(c => c.id),
        selectedWireIds: newWires.map(w => w.id),
        selectedRectIds: newRectangles.map(r => r.id),
        selectedComponentId: null,
        selectedWireId: null,
        selectedRectId: null
      }
    })
    get().saveToHistory()
  }
}))

export default useSchematicStore
