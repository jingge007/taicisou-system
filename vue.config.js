/*const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // publicPath: '/taicisou-system/'
  publicPath: '/',
  devServer: {
    proxy: {
      '/': {
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
  devServer: {
    proxy: {
      '/apollo': {
        target: 'https://i.maoyan.com',
        changeOrigin: true,
        pathRewrite: {
          '^/apollo': '/apollo',
        },
      },
    },
  },
};