import { create } from 'zustand'

const useSchematicStore = create((set) => ({
  wires: [],
  selectedWireId: null,
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

  setSelectedWire: (id) => set({ selectedWireId: id }),

  setWireColor: (color) => set({ wireColor: color }),

  setWireThickness: (thickness) => set({ wireThickness: thickness }),

  clearSelection: () => set({ selectedWireId: null })
}))

export default useSchematicStore
