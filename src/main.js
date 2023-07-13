import Vue from 'vue'
import router from './router'
import store from './store'
import $axios from './api/axios.config';
import App from './App.vue';
import ViewUI from 'view-design';
import Moment from 'moment';
import components from '@/utils/components';
import 'view-design/dist/styles/iview.css';
import '@/styles/index.less'

Vue.use(ViewUI, {
  transfer: true
});
Moment.locale('zh-cn');
window.moment = Moment;
Vue.use(components, Moment);
Vue.config.productionTip = false;
new Vue({
  router,
  $axios,
  store,
  render: h => h(App)
}).$mount('#app');
