/*const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // publicPath: '/taicisou-system/'
  publicPath: '/',
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: {
      '/': {
        ws: false,
        target: 'https://i.maoyan.com',
        changeOrigin: true,
        pathRewrite: {
          '^/': '',
        },
      },
    },
  },
})*/


module.exports = {
  publicPath: '/',
  devServer: {
    proxy: {
      '/api': {
        target: 'https://i.maoyan.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/',
        },
      },
      '/leancloud': {
        target: 'https://cloud.api.taicisou.cn',
        changeOrigin: true,
        pathRewrite: {
          '^/leancloud': '/'
        }
      }
    },
  },
};
