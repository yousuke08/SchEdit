export const GRID_SIZE = 20

export function snapToGrid(value, gridSize = GRID_SIZE) {
  return Math.round(value / gridSize) * gridSize
}

export function snapPointToGrid(point, gridSize = GRID_SIZE) {
  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize)
  }
}

export function screenToWorld(screenPoint, pan, zoom) {
  return {
    x: (screenPoint.x - pan.x) / zoom,
    y: (screenPoint.y - pan.y) / zoom
  }
}

export function worldToScreen(worldPoint, pan, zoom) {
  return {
    x: worldPoint.x * zoom + pan.x,
    y: worldPoint.y * zoom + pan.y
  }
}
