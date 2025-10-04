export function distanceToLineSegment(point, lineStart, lineEnd) {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    // Line segment is a point
    const pdx = point.x - lineStart.x
    const pdy = point.y - lineStart.y
    return Math.sqrt(pdx * pdx + pdy * pdy)
  }

  // Calculate projection parameter t
  let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared
  t = Math.max(0, Math.min(1, t))

  // Calculate closest point on line segment
  const closestX = lineStart.x + t * dx
  const closestY = lineStart.y + t * dy

  // Calculate distance to closest point
  const pdx = point.x - closestX
  const pdy = point.y - closestY
  return Math.sqrt(pdx * pdx + pdy * pdy)
}
