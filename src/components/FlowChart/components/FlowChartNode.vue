<template>
  <g
    :class="inLink?'in-link':''"
    :transform="`translate(${currentNode.x}, ${currentNode.y})`">
    <g v-if="isLinkHandler">
      <circle
        r="4"
        fill="#616161"
        pointer-events="none"></circle>
    </g>
    <g
      v-else
      style="user-select: none;"
      cursor="move"
      @mousedown.stop="e => handleMouseDown(e, currentNode)">
      <rect
        class="g-box"
        :data-id="currentNode.id"
        :width="currentNode.width"
        :height="currentNode.height"
        rx="4"
        ry="4"
        :stroke="currentNode.borderColor||'#2e7d32'"
        fill="rgba(255,255,255,0)">
      </rect>
      <slot pointer-events="none"></slot>
      <circle
        r="4"
        :stroke="currentNode.indicatorColor||'#1b5e20'"
        :fill="currentNode.indicatorColor||'#1b5e20'"
        cursor="pointer"
        :transform="`translate(${currentNode.width/2}, ${currentNode.height})`"
        @mousedown.stop="e => handleStartLink(e, currentNode)"></circle>
    </g>
  </g>
</template>

<script>
export default {
  name: 'FlowChartNode',
  props: {
    isLinkHandler: {
      type: Boolean,
      default: false
    },
    inLink: {
      type: Boolean,
      default: false
    },
    node: {
      type: Object,
      default: () => {}
    },
    scale: {
      type: Number,
      default: 1
    },
    viewOffseX: {
      type: Number,
      default: 0
    },
    viewOffseY: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      currentNode: {}
    }
  },
  watch: {
    node: {
      immediate: true,
      handler (node) {
        this.currentNode = node
      }
    }
  },
  methods: {
    handleStartLink(e, currentNode, offset = { x: 0, y: 0 }) {
      const $svgContainer = this.$parent.$svgContainer

      this.$emit('in-link-change', true)
      const { offsetX, offsetY } = e
      const holder = this.createPlaceholder(currentNode.id, offsetX, offsetY)

      const handleMouseUp = e => {
        $svgContainer.removeEventListener('mousemove', handleMouseMove)
        $svgContainer.removeEventListener('mouseup', handleMouseUp)
        this.$emit('remove-node', holder.id)
        this.$emit('in-link-change', false)
        const targetId = e.target.getAttribute('data-id')
        if (targetId && targetId !== currentNode.id) {
          this.$emit('link-node', targetId, currentNode.id)
        }
      }

      const handleMouseMove = e => {
        this.handleMouseMove(e, holder, offset)
      }

      $svgContainer.addEventListener('mousemove', handleMouseMove)
      $svgContainer.addEventListener('mouseup', handleMouseUp)
    },
    handleMouseDown(e, currentNode) {
      const { x, y } = currentNode
      const { offsetX, offsetY } = e

      const offset = {
        x: x / this.scale - offsetX,
        y: y / this.scale - offsetY
      }

      const $svgContainer = this.$parent.$svgContainer

      const handleMouseUp = () => {
        $svgContainer.removeEventListener('mousemove', handleMouseMove)
        $svgContainer.removeEventListener('mouseup', handleMouseUp)
      }

      const handleMouseMove = e => {
        this.handleMouseMove(e, currentNode, offset)
      }

      $svgContainer.addEventListener('mousemove', handleMouseMove)
      $svgContainer.addEventListener('mouseup', handleMouseUp)
    },
    handleMouseMove(e, currentNode, offset) {
      const { offsetX, offsetY } = e
      currentNode.x = (offsetX + offset.x) * this.scale
      currentNode.y = (offsetY + offset.y) * this.scale
    },
    createPlaceholder (prevId, x, y) {
      const holder = {
        id: Math.random() + '',
        prevId,
        x,
        y,
        height: 0,
        width: 0,
        isLinkHandler: true
      }
      this.$emit('create-placeholder', holder)
      return holder
    }
  }
}
</script>

<style scoped>
.in-link .g-box:hover {
  /* outline: 2px solid #ccc; */
  box-shadow: 0px 0px 2px 4px black;
}
</style>
