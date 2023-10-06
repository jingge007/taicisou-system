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
