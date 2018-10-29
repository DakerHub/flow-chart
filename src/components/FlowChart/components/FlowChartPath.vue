<template>
  <g>
    <path
      :d="getSvgPath(currentPath.start, currentPath.end)"
      :stroke="pahtColor"
      stroke-width="1"
      fill="none"></path>
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
    pahtColor: {
      type: String,
      default: '#b39ddb'
    }
  },
  data () {
    return {
      currentPath: null
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
