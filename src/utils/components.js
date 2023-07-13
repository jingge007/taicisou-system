import baseIcon from '@/components/baseIcon';

const plugins = {
  //注册
  install(Vue) {
    Vue.component('baseIcon',baseIcon);
  }
}
export default plugins;