/*
import AV from 'leancloud-storage';

const appId = '4wMHbg1FPt1bYoyIyYBlD3jE-gzGzoHsz';
const appKey = 'HbD3ilhNBYxazGziTEzEIwRv';
const serverURL = 'https://cloud.api.taicisou.cn';

AV.init({appId, appKey, serverURL});
AV.debug.enable();

export default {
  install: (Vue) => {
    Vue.prototype.$leancloud = AV;
  },
};
*/

// src/utils/leancloud.js
import * as AVLib from 'leancloud-storage'

// ====== 配置文件（维护应用信息） ======
const leancloudAppsConfig = [
  {
    name: 'default',
    appId: '4wMHbg1FPt1bYoyIyYBlD3jE-gzGzoHsz',
    appKey: 'HbD3ilhNBYxazGziTEzEIwRv',
    serverURL: 'https://cloud.api.taicisou.cn'
  },
  {
    name: 'movieSubtitleData',
    appId: 'HYBYpS5zqlrZGtEhgjPOHiUc-gzGzoHsz',
    appKey: 'ZNssFucAhR28OvEi6aLceq5m',
    serverURL: 'https://moviesubtitle.api.taicisou.cn'
  },
]

// ====== 缓存已初始化的实例 ======
const appInstances = {}

/**
 * 获取 LeanCloud 应用实例
 * @param {String} appName 应用名称（配置中的 name）
 * @returns {Object} AV 实例
 */
export function getLeancloudApp(appName = 'default') {
  if (appInstances[appName]) {
    return appInstances[appName]
  }
  
  const appConfig = leancloudAppsConfig.find(a => a.name === appName)
  if (!appConfig) {
    throw new Error(`未找到名为 "${appName}" 的 LeanCloud 应用配置`)
  }
  
  const {appId, appKey, serverURL} = appConfig
  
  // ⚠️ 创建新的独立 AV 副本（深拷贝）
  const AVInstance = Object.assign({}, AVLib)
  
  AVInstance.init({appId, appKey, serverURL})
  if (AVInstance.debug && AVInstance.debug.enable) {
    AVInstance.debug.enable()
  }
  
  appInstances[appName] = AVInstance
  return AVInstance
}

// ====== Vue 插件注册 ======
export default {
  install(Vue) {
    Vue.prototype.$leancloud = getLeancloudApp('default')
    Vue.prototype.$getLeancloudApp = getLeancloudApp
  }
}


