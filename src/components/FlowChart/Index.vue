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

      <circle
        r="4"
        fill="#616161"
        transform="translate(100, 100)"
        @click="test"></circle>

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
  </div>
</template>

<script>
import FlowChartNode from './components/FlowChartNode'
import FlowChartPath from './components/FlowChartPath'
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
      type: String,
      default: '640'
    },
    height: {
      type: String,
      default: '640'
    }
  },
  components: {
    FlowChartNode,
    FlowChartPath
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
      let finalS = targetS > 2 ? 2 : targetS
      finalS = finalS < 0.5 ? 0.5 : finalS
      this.scale = finalS
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

        if (targetX * this.scale > 500) {
          targetX = 500 / this.scale
        }
        if (targetY * this.scale > 500) {
          targetY = 500 / this.scale
        }
        if (targetX * this.scale < -500) {
          targetX = -500 / this.scale
        }
        if (targetY * this.scale < -500) {
          targetY = -500 / this.scale
        }
        this.svgOffsetX = targetX
        this.svgOffsetY = targetY
      }

      $svgContainer.addEventListener('mousemove', handleMouseMove)
      $svgContainer.addEventListener('mouseup', handleMouseUp)
    },
    test(e) {
      console.log(e)
    }
  }
}
</script>

<style scoped>
.flow-chart {
  overflow: hidden;
}
</style>
