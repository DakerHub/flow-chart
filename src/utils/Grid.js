export default class Grid {
  grid = []
  row = 0
  col = 0
  constructor(row, col) {
    this.row = row
    this.col = col
    this.initGrid()
  }
  initGrid () {
    this.grid = new Array(this.col).fill(0)
    this.grid.forEach((col, i, arr) => {
      arr[i] = new Array(this.row).fill(0)
    })
  }
  getGrid () {
    return this.grid
  }
}