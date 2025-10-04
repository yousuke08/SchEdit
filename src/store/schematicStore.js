import { create } from 'zustand'

const useSchematicStore = create((set) => ({
  wires: [],
  components: [],
  selectedWireId: null,
  selectedComponentId: null,
  wireColor: '#00ff00',
  wireThickness: 2,

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

  clearSelection: () => set({ selectedWireId: null, selectedComponentId: null })
}))

export default useSchematicStore
