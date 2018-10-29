<template>
  <div class="flow-chart">
    <svg
      class="svg-container"
      :width="width"
      :height="height"
      :viewBox="`${svgOffsetX * scale} ${svgOffsetY * scale} ${svgWidth * scale} ${svgHeight * scale}`"
      :cursor="inGrab?'grabbing':'grab'"
      @mousedown="handleMouseDown"
      @mousewheel="handleMousewheel">
      <FlowChartPath
        class="flow-chart-path"
        v-for="(item,index) in paths"
        :key="index"
        :path="item"
        :scale="scale"
        :paht-color="pahtColor"></FlowChartPath>

      <FlowChartNode
        class="flow-chart-node"
        v-for="(item,index) in nodes"
        :key="'rect'+index"
        :node="item"
        :in-link="inLink"
        :scale="scale"
        :view-offse-x="svgOffsetX"
        :view-offse-y="svgOffsetY"
        :is-link-handler="item.isLinkHandler"
        @create-placeholder="createPlaceholder"
        @remove-node="removeNode"
        @link-node="linkNode"
        @in-link-change="val => inLink = val">
        <slot :node="item" name="content" pointer-events="none"></slot>
      </FlowChartNode>
    </svg>
    <FlowChartThumbnail
      :scale="scale"
      :max-width="maxWidth"
      :max-height="maxHeight"
      :view-width="width"
      :view-height="height"
      :offset-x="svgOffsetX"
      :offset-y="svgOffsetY"></FlowChartThumbnail>
  </div>
</template>

<script>
import FlowChartNode from './components/FlowChartNode'
import FlowChartPath from './components/FlowChartPath'
import FlowChartThumbnail from './components/FlowChartThumbnail'
import getPathPoints from './lib/getPathPoints.js'

export default {
  name: 'FlowChart',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    pahtColor: {
      type: String,
      default: '#b39ddb'
    },
    width: {
      type: Number,
      default: 640
    },
    height: {
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
    }
  },
  components: {
    FlowChartNode,
    FlowChartPath,
    FlowChartThumbnail
  },
  data() {
    return {
      nodes: [],
      scale: 1,
      svgHeight: 0,
      svgWidth: 0,
      svgOffsetX: 0,
      svgOffsetY: 0,
      inGrab: false,
      inLink: false,
      $svgContainer: null
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.nodes = val
      }
    }
  },
  computed: {
    paths() {
      return getPathPoints(this.nodes)
    }
  },
  mounted() {
    this.$svgContainer = this.$el.querySelector('.svg-container')
    this.svgHeight = this.$svgContainer.clientHeight
    this.svgWidth = this.$svgContainer.clientWidth
  },
  methods: {
    createPlaceholder(placeholder) {
      this.nodes.push(placeholder)
    },
    removeNode(nodeId) {
      const idx = this.nodes.findIndex(i => i.id === nodeId)
      if (idx !== -1) {
        this.nodes.splice(idx, 1)
      }
    },
    linkNode(targetNodeId, currentNodeId) {
      const targetNode = this.nodes.find(r => r.id === targetNodeId)
      if (targetNode) {
        targetNode.prevId = currentNodeId
      }
    },
    handleMousewheel(e) {
      if (!(this.scale >= 0.5 && this.scale <= 2)) return
      const deltaS = e.wheelDeltaY / 1200
      const targetS = this.scale - deltaS

      const maxScaleX = this.maxWidth / this.width
      const maxScaleY = this.maxHeight / this.height

      const minScale = Math.min(maxScaleX, maxScaleY)

      let finalS = targetS > minScale ? minScale : targetS
      finalS = finalS < 0.5 ? 0.5 : finalS
      this.scale = finalS

      // 防止放大的时候溢出
      if ((this.svgOffsetX + this.width) * finalS > this.maxWidth) {
        this.svgOffsetX = this.maxWidth / finalS - this.width
      }
      if ((this.svgOffsetY + this.height) * finalS > this.maxHeight) {
        this.svgOffsetY = this.maxHeight / finalS - this.height
      }
    },
    handleMouseDown(e) {
      this.inGrab = true
      const { offsetX: oriOffsetX, offsetY: oriOffsetY } = e
      const oriSvgOffsetX = this.svgOffsetX
      const oriSvgOffsetY = this.svgOffsetY

      const $svgContainer = this.$svgContainer

      const handleMouseUp = () => {
        this.inGrab = false
        $svgContainer.removeEventListener('mousemove', handleMouseMove)
        $svgContainer.removeEventListener('mouseup', handleMouseUp)
      }

      const handleMouseMove = e => {
        const { offsetX, offsetY } = e

        let targetX = oriSvgOffsetX + oriOffsetX - offsetX
        let targetY = oriSvgOffsetY + oriOffsetY - offsetY

        if ((targetX + this.width) * this.scale > this.maxWidth) {
          targetX = this.maxWidth / this.scale - this.width
        }
        if ((targetY + this.height) * this.scale > this.maxHeight) {
          targetY = this.maxHeight / this.scale - this.height
        }
        if (targetX * this.scale < 0) {
          targetX = 0
        }
        if (targetY * this.scale < 0) {
          targetY = 0
        }
        this.svgOffsetX = targetX
        this.svgOffsetY = targetY
      }

      $svgContainer.addEventListener('mousemove', handleMouseMove)
      $svgContainer.addEventListener('mouseup', handleMouseUp)
    }
  }
}
</script>

<style scoped>
.flow-chart {
  position: relative;
}
.flow-chart-thumbnail {
  position: absolute;
  right: 10px;
  top: 10px;
}
</style>
