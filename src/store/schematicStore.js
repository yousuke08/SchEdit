import { create } from 'zustand'

const useSchematicStore = create((set) => ({
  wires: [],
  components: [],
  selectedWireId: null,
  selectedComponentId: null,
  selectedWireIds: [],
  selectedComponentIds: [],
  wireColor: '#ffffff',
  wireThickness: 2,
  editorMode: 'draw', // 'draw' or 'select'

  addWire: (wire) => set((state) => ({
    wires: [...state.wires, { ...wire, id: crypto.randomUUID() }]
  })),

  removeWire: (id) => set((state) => ({
    wires: state.wires.filter(w => w.id !== id),
    selectedWireId: state.selectedWireId === id ? null : state.selectedWireId
  })),

  updateWire: (id, updates) => set((state) => ({
    wires: state.wires.map(w => w.id === id ? { ...w, ...updates } : w)
  })),

  setSelectedWire: (id) => set({ selectedWireId: id, selectedComponentId: null }),

  setWireColor: (color) => set({ wireColor: color }),

  setWireThickness: (thickness) => set({ wireThickness: thickness }),

  addComponent: (component) => set((state) => ({
    components: [...state.components, { ...component, id: crypto.randomUUID() }]
  })),

  removeComponent: (id) => set((state) => ({
    components: state.components.filter(c => c.id !== id),
    selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId
  })),

  updateComponent: (id, updates) => set((state) => ({
    components: state.components.map(c => c.id === id ? { ...c, ...updates } : c)
  })),

  setSelectedComponent: (id) => set({ selectedComponentId: id, selectedWireId: null }),

  clearSelection: () => set({ selectedWireId: null, selectedComponentId: null, selectedWireIds: [], selectedComponentIds: [] }),

  setEditorMode: (mode) => set({ editorMode: mode }),

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
  }))
}))

export default useSchematicStore
