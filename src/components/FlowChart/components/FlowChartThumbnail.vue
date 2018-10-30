<template>
  <div class="flow-chart-thumbnail">
    <div
      :style="boxStyle"
      class="flow-chart-thumbnail_box">
      <div
        class="flow-chart-thumbnail_view"
        :style="style">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FlowChartThumbnail',
  props: {
    scale: {
      type: Number,
      default: 1
    },
    viewWidth: {
      type: Number,
      default: 640
    },
    viewHeight: {
      type: Number,
      default: 640
    },
    maxWidth: {
      type: Number,
      default: 1000
    },
    maxHeight: {
      type: Number,
      default: 1000
    },
    offsetX: {
      type: Number,
      default: 0
    },
    offsetY: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {}
  },
  computed: {
    style() {
      const width = (100 * this.viewWidth) / this.maxWidth
      const height = (100 * this.viewHeight) / this.maxHeight
      const top = (100 * this.offsetY * this.scale) / this.maxHeight
      const left = (100 * this.offsetX * this.scale) / this.maxWidth
      return {
        width: `${width * this.scale}px`,
        height: `${height * this.scale}px`,
        top: `${top}px`,
        left: `${left}px`
      }
    },
    boxStyle() {
      const width = 100
      const height = (100 * this.maxHeight) / this.maxWidth
      return {
        width: `${width}px`,
        height: `${height}px`
      }
    }
  }
}
</script>

<style scoped>
.flow-chart-thumbnail {
  width: 100px;
  height: 100px;
  border: thin solid #ccc;
}
.flow-chart-thumbnail_box {
  position: relative;
  background-color: rgba(0, 0, 0, 0.1);
}
.flow-chart-thumbnail_view {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.8);
  outline: thin solid #FFEB3B;
}
</style>
