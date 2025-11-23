import { create } from 'zustand'

const MAX_HISTORY = 50

const useSchematicStore = create((set, get) => ({
  wires: [],
  components: [],
  selectedWireId: null,
  selectedComponentId: null,
  selectedWireIds: [],
  selectedComponentIds: [],
  wireColor: '#ffffff',
  wireThickness: 2,
  wireStyle: 'solid', // 'solid', 'double', 'dashed', 'dash-dot', 'wavy', 'double-wavy'
  clipboard: { components: [], wires: [] },
  history: [],
  historyIndex: -1,

  // Save current state to history
  saveToHistory: () => {
    const state = get()
    const snapshot = {
      wires: JSON.parse(JSON.stringify(state.wires)),
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
      components: JSON.parse(JSON.stringify(snapshot.components)),
      historyIndex: newIndex,
      selectedWireId: null,
      selectedComponentId: null,
      selectedWireIds: [],
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
      components: JSON.parse(JSON.stringify(snapshot.components)),
      historyIndex: newIndex,
      selectedWireId: null,
      selectedComponentId: null,
      selectedWireIds: [],
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

  setSelectedWire: (id) => set({ selectedWireId: id, selectedComponentId: null }),

  setWireColor: (color) => set({ wireColor: color }),

  setWireThickness: (thickness) => set({ wireThickness: thickness }),

  setWireStyle: (style) => set({ wireStyle: style }),

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

  setSelectedComponent: (id) => set({ selectedComponentId: id, selectedWireId: null }),

  clearSelection: () => set({ selectedWireId: null, selectedComponentId: null, selectedWireIds: [], selectedComponentIds: [] }),

  setMultipleSelection: (wireIds, componentIds) => set({
    selectedWireIds: wireIds,
    selectedComponentIds: componentIds,
    selectedWireId: null,
    selectedComponentId: null
  }),

  addToSelection: (wireId, componentId) => set((state) => ({
    selectedWireIds: wireId && !state.selectedWireIds.includes(wireId)
      ? [...state.selectedWireIds, wireId]
      : state.selectedWireIds,
    selectedComponentIds: componentId && !state.selectedComponentIds.includes(componentId)
      ? [...state.selectedComponentIds, componentId]
      : state.selectedComponentIds
  })),

  copyToClipboard: (components, wires) => set({
    clipboard: { components, wires }
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
      return {
        components: [...state.components, ...newComponents],
        wires: [...state.wires, ...newWires],
        selectedComponentIds: newComponents.map(c => c.id),
        selectedWireIds: newWires.map(w => w.id),
        selectedComponentId: null,
        selectedWireId: null
      }
    })
    get().saveToHistory()
  }
}))

export default useSchematicStore
