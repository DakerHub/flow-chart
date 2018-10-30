<template>
  <g>
    <path
      :d="getSvgPath(currentPath.start, currentPath.end)"
      :stroke="inSelect?'#FFEB3B':pathColor"
      :stroke-width="inSelect?6:3"
      stroke-linejoin="round"
      fill="none"
      cursor="pointer"></path>
  </g>
</template>

<script>
import getSvgPath from './../lib/getSvgPath.js'

export default {
  name: 'FlowChartPath',
  props: {
    path: {
      type: Object,
      default: () => {}
    },
    pathColor: {
      type: String,
      default: '#b39ddb'
    },
    currentPathId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      currentPath: null
    }
  },
  computed: {
    inSelect () {
      return this.currentPathId === this.path.id
    }
  },
  watch: {
    path: {
      immediate: true,
      handler (path) {
        this.currentPath = path
      }
    }
  },
  methods: {
    getSvgPath
  }
}
</script>

<style scoped>

</style>
