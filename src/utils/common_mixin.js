export default {
  data() {
    return {
      sixIemCol: {
        // 头部筛选区域划分为六等分
        span: 4
      },
      fourItemCol: {
        // 头部筛选区域划分为四等分
        span: 6
      },
      threeItemCol: {
        // 头部筛选区域划分为三等分
        span: 8
      },
      twoItemCol: {
        // 头部筛选区域划分为二等分
        span: 12
      },
      oneItemCol: {
        // 头部筛选区域划分为一等分
        span: 24
      },
      gutterItem: 16,
      viewerOptions: {
        navbar: false, // 是否显示缩略图底部导航栏
        title: false, // 是否显示缩略图标题栏
        zIndex: 9999999,
        toolbar: {
          zoomIn: true,
          zoomOut: true,
          oneToOne: true,
          reset: false, // 隐藏重置按钮
          prev: false, // 隐藏左翻页按钮
          play: false, // 隐藏播放按钮
          next: false, // 隐藏右翻页按钮
          rotateLeft: true,
          rotateRight: true,
          flipHorizontal: true,
          flipVertical: true
        }
      },
    };
  }
};