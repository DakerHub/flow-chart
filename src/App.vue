<template>
  <div id="app">
    <FlowChart
      style="border:thin solid #1a237e;height:500px;width:600px;"
      :value="rects"
      :width="600"
      :height="500"
      :maxWidth="1200"
      :maxHeight="500"
      path-color="#4CAF50"
      :show-grid="showGrid"
      :tools="['thumbnail', 'resetScale']"
      :use-router="useRouter"
      @delete-path="handleDeletePath"
      @delete-node="handleDeleteNode">
      <template slot-scope="{node}" slot="content">
        <g
          style="font-family:Times New Roman,sans-serif;font-weight:bold;">
          <title>{{node.text}}</title>
          <text
            pointer-events="none"
            dx="100"
            dy="24"
            text-anchor="middle">
            {{node.text|textEllipsis(14, node.width - 20 )}}
          </text>
        </g>
        <image
          width="20"
          height="20"
          x="20"
          y="30"
          cursor="pointer"
          xlink:href="https://famaomao.oss-cn-shenzhen.aliyuncs.com/fff/public/static/svg/setting.svg"
          @click="handleToolClick('setting', node)"/>
        <image
          width="20"
          height="20"
          x="50"
          y="30"
          cursor="pointer"
          xlink:href="https://famaomao.oss-cn-shenzhen.aliyuncs.com/fff/public/static/svg/editting.svg"
          @click="handleToolClick('rename', node)"/>
        <image
          width="20"
          height="20"
          x="80"
          y="30"
          cursor="pointer"
          xlink:href="https://famaomao.oss-cn-shenzhen.aliyuncs.com/fff/public/static/svg/delete.svg"
          @click="handleToolClick('delete', node)"/>
      </template>
    </FlowChart>
    <button
      style="position:fixed;right:10px;top:10px;"
      @click="addRandom">添加</button>
    <button
      style="position:fixed;right:10px;top:40px;"
      @click="showGrid=!showGrid">网格</button>
    <button
      style="position:fixed;right:10px;top:70px;"
      @click="useRouter=!useRouter">{{useRouter?'使用连线算法':'使用路由算法'}}</button>
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
      nodes: data.data.todoList,
      showGrid: false,
      useRouter: true
    }
  },
  filters: {
    textEllipsis(text, fontSize, maxWidth) {
      if (!text) return ''
      const doubleCharMatcher = /[^x00-xff]/
      let formatText = text
      let totalWidth = 0
      const textArr = text.split('')
      for (let i = 0; i < textArr.length; i++) {
        if (totalWidth > maxWidth - 40) {
          formatText = text.substring(0, i) + '...'
          break
        }
        const char = textArr[i]
        if (doubleCharMatcher.test(char)) {
          totalWidth += fontSize
        } else {
          totalWidth += fontSize / 2
        }
      }
      return formatText
    }
  },
  methods: {
    addRandom() {
      const text = prompt('Say Something', '')
      this.rects.push({
        id: Math.random() + '',
        x: 0,
        y: 0,
        height: 60,
        width: 200,
        text: text,
        borderColor: '#FF4081',
        prevId: ''
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
    },
    handleDeletePath(nodeId, prevNodeId) {
      const node = this.rects.find(n => n.id === nodeId)
      if (node) {
        node.prevId = null
      }
      // 映射到process里面就是前置条件去掉prevNodeId
    },
    handleDeleteNode(nodeId) {
      const idx = this.rects.findIndex(n => n.id === nodeId)
      if (idx === -1) return
      this.rects.forEach(node => {
        if (node.prevId === nodeId) {
          node.prevId = null
        }
      })
      this.rects.splice(idx, 1)
      // 删除process
    },
    handleToolClick(operator, node) {
      alert(operator)
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
