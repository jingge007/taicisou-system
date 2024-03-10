const { defineConfig } = require('@vue/cli-service')
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
})


/*
module.exports = {
  publicPath: '/',
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
};*/
