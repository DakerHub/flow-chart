<template>
  <div class="flow-chart">
    <svg
      class="svg-container"
      :width="width"
      :height="height"
      :viewBox="`${svgOffsetX * scale} ${svgOffsetY * scale} ${width * scale} ${height * scale}`"
      :cursor="inGrab?'grabbing':'grab'"
      @mousedown.stop="handleMouseDown"
      @mousewheel="handleMousewheel"
      @click.left="handleContainerClick">
      <FlowChartGrid
        :row="50"
        :col="50"
        :maxWidth="maxWidth"
        :maxHeight="maxHeight"
        :blocks="blocks"></FlowChartGrid>

      <FlowChartPath
        class="flow-chart-path"
        v-for="(item,index) in paths"
        :key="index"
        :path="item"
        :scale="scale"
        :path-color="pathColor"
        :current-path-id="currentPathId"
        @click.native.stop="handleClickPath(item)"></FlowChartPath>

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
        :current-node-id="currentNodeId"
        @create-placeholder="createPlaceholder"
        @remove-node="removeNode"
        @link-node="linkNode"
        @in-link-change="val => inLink = val"
        @click.native.stop="handleClickNode(item)">
        <slot :node="item" name="content" pointer-events="none"></slot>
      </FlowChartNode>
    </svg>

    <div
      class="flow-chart-tools">
      <FlowChartThumbnail
        class="flow-chart-tool"
        v-if="tools.includes('thumbnail')"
        :scale="scale"
        :max-width="maxWidth"
        :max-height="maxHeight"
        :view-width="width"
        :view-height="height"
        :offset-x="svgOffsetX"
        :offset-y="svgOffsetY">
      </FlowChartThumbnail>

      <button
        v-if="tools.includes('resetScale')"
        class="flow-chart-tool flow-chart-reset-scale"
        @click="handleResetScale">重置缩放</button>
    </div>
  </div>
</template>

<script>
import FlowChartNode from './components/FlowChartNode'
import FlowChartPath from './components/FlowChartPath'
import FlowChartThumbnail from './components/FlowChartThumbnail'
import FlowChartGrid from './components//FlowChartGrid'
import getPathPoints from './lib/getPathPoints.js'
import Grid from '../../utils/Grid.js'

export default {
  name: 'FlowChart',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    pathColor: {
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
    },
    tools: {
      type: Array,
      default: () => ['thumbnail', 'resetScale']
    }
  },
  components: {
    FlowChartNode,
    FlowChartPath,
    FlowChartThumbnail,
    FlowChartGrid
  },
  data() {
    return {
      nodes: [],
      scale: 1,
      svgOffsetX: 0,
      svgOffsetY: 0,
      inGrab: false,
      inLink: false,
      $svgContainer: null,
      currentPathId: '',
      currentNodeId: '',
      blocks: []
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
  created() {
    const grid = new Grid(50, 50, this.maxWidth, this.maxHeight)
    this.blocks = grid.addBlocks(this.nodes)
    console.log(grid.getGrid())
  },
  mounted() {
    this.$svgContainer = this.$el.querySelector('.svg-container')
    this.bindHotKey()
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
    bindHotKey() {
      document.addEventListener('keyup', e => {
        if (e.key === 'Delete') {
          if (this.currentPathId) {
            return this.deleteCurrentPath()
          }
          if (this.currentNodeId) {
            return this.deleteCurrentNode()
          }
        }
      })
    },
    deleteCurrentPath() {
      const currentPath = this.paths.find(p => p.id === this.currentPathId)
      if (!currentPath) return

      const prevId = currentPath.prevId
      this.$emit('delete-path', this.currentPathId, prevId)
    },
    deleteCurrentNode() {
      this.$emit('delete-node', this.currentNodeId)
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
    },
    handleClickPath(item) {
      this.currentPathId = item.id
    },
    handleClickNode(item) {
      this.currentNodeId = item.id
      this.currentPathId = ''
      this.$emit('current-node-change', item.id)
    },
    handleContainerClick() {
      this.currentPathId = ''
      this.currentNodeId = ''
    },
    handleResetScale() {
      this.scale = 1
      this.svgOffsetX = 0
      this.svgOffsetY = 0
    }
  }
}
</script>

<style scoped>
.flow-chart {
  position: relative;
}
.flow-chart-tools {
  position: absolute;
  right: 10px;
  top: 10px;
  text-align: right;
}
.flow-chart-tool {
  margin-bottom: 10px;
}

.flow-chart-reset-scale {
  border: thin solid #ccc;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  outline: none;
  transition: all 0.3s;
}
.flow-chart-reset-scale:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
.flow-chart-reset-scale:active {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
