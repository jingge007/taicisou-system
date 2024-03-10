// 该服务为 vercel serve跨域处理
const {createProxyMiddleware} = require('http-proxy-middleware')
module.exports = (req, res) => {
  // 代理目标地址
  let target = 'https://i.maoyan.com'
  // 创建代理对象并转发请求
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      // 通过路径重写，去除请求路径中的 `/api`
      '^/apollo/': '/apollo'
    }
  })(req, res)
}