export default function(rects) {
  const pointMap = {}
  const pathPoints = []
  rects.forEach(rect => {
    pointMap[rect.id] = {
      entry: {
        x: rect.x + rect.width / 2,
        y: rect.y,
        vector: {
          x: 0,
          y: -1
        }
      },
      output: {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height,
        vector: {
          x: 0,
          y: 1
        }
      }
    }
  })
  rects.forEach(rect => {
    if (rect.prevId) {
      pathPoints.push({
        start: pointMap[rect.prevId].output,
        end: pointMap[rect.id].entry
      })
    }
  })
  return pathPoints
}
