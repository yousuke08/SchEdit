// Check if a point is on a line segment
export function isPointOnLineSegment(point, lineStart, lineEnd, tolerance = 0.1) {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    return Math.abs(point.x - lineStart.x) < tolerance && Math.abs(point.y - lineStart.y) < tolerance
  }

  // Calculate projection parameter t
  let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared

  // Check if point is within the line segment
  if (t < -tolerance || t > 1 + tolerance) {
    return false
  }

  // Calculate closest point on line
  const closestX = lineStart.x + t * dx
  const closestY = lineStart.y + t * dy

  // Check distance to closest point
  const distSquared = Math.pow(point.x - closestX, 2) + Math.pow(point.y - closestY, 2)
  return distSquared < tolerance * tolerance
}

// Check if a new wire segment overlaps with an existing wire
export function isWireOverlapping(newStart, newEnd, existingWire, tolerance = 0.1) {
  // Check if both endpoints of the new wire are on the existing wire
  const startOnLine = isPointOnLineSegment(newStart, existingWire.start, existingWire.end, tolerance)
  const endOnLine = isPointOnLineSegment(newEnd, existingWire.start, existingWire.end, tolerance)

  return startOnLine && endOnLine
}

// Check if the new wire should be created or if it overlaps with existing wires
export function shouldCreateWire(newStart, newEnd, existingWires) {
  for (const wire of existingWires) {
    if (isWireOverlapping(newStart, newEnd, wire)) {
      return false
    }
  }
  return true
}
