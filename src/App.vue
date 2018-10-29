<template>
  <div id="app">
    <FlowChart
      style="border:thin solid #1a237e;height:640px;width:640px;"
      :value="rects"
      paht-color="#4CAF50">
      <template slot-scope="{node}" slot="content">
        <text
          pointer-events="none"
          dx="10"
          dy="24">{{node.text}}</text>
      </template>
    </FlowChart>
    <button
      style="position:fixed;right:10px;top:10px;"
      @click="addRandom">添加</button>
  </div>
</template>

<script>
import FlowChart from './components/FlowChart/Index'
import data from './assets/data.js'
import dataFormatted from './assets/dataFormatted.js'

export default {
  name: 'App',
  components: {
    FlowChart
  },
  data() {
    return {
      rects: dataFormatted,
      nodes: data.data.todoList
    }
  },
  created() {
    // this.formatNodes()
  },
  methods: {
    addRandom() {
      this.rects.push({
        id: Math.random() + '',
        x: 250,
        y: 450,
        height: 60,
        width: 100,
        text: '1234'
      })
    },
    formatNodes() {
      const nodes = this.nodes.map(node => {
        const { _id, conditions, content } = node
        const prevNode = conditions.find(c => c.type === 'Process')
        return {
          id: _id,
          prevId: prevNode && prevNode.field,
          x: 10,
          y: 10,
          height: 60,
          width: 200,
          borderColor: '#512DA8',
          indicatorColor: '#FFEB3B',
          text: content
        }
      })
      this.rects = nodes
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 640px;
}
</style>
