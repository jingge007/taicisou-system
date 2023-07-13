<template>
  <span class="iconfont" :class="iconTag" :style="{color: color, fontSize: size}">
      <slot></slot>
    </span>
</template>

<style lang="less" scoped>
.iconfont {
  font-family: "iconfont" !important;
  font-size: 2em;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

<script type="text/ecmascript-6">

export default {
  name: 'iconFontClass',
  props: {
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: '#666'
    },
    size: {
      type: String,
      default: '18px'
    }
  },
  computed: {
    iconTag () {
      return this.name;
    }
  }
};
</script>