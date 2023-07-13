import axios from 'axios';
import router from '../router/index';
import {Spin, Modal} from 'view-design';

function startLoading () {
  Spin.show({
    render: (h) => {
      return h('div', {
        style: {
          zIndex: 8888,
          backgroundColor: '#fff',
          padding: '32px 30px',
          borderRadius: '12px'
        }
      }, [
        h('Icon', {
          'class': 'demo-spin-icon-load',
          props: {
            type: 'ios-loading',
            size: 28
          }
        }),
        h('div', {
          style: {
            marginTop: '5px',
            fontSize: '17px'
          }
        }, '加载中...')
      ]);
    }
  });
}
function endLoading () {
  Spin.hide();
}
let needLoadingRequestCount = 0;
export function showFullScreenLoading () {
  if (needLoadingRequestCount === 0) {
    startLoading();
  }
  needLoadingRequestCount++;
}
export function tryHideFullScreenLoading () {
  if (needLoadingRequestCount <= 0) return;
  needLoadingRequestCount--;
  if (needLoadingRequestCount === 0) {
    endLoading();
  }
}
axios.defaults.timeout = 30000;
axios.defaults.withCredentials = true; // 跨域默认不带cookie
axios.defaults.baseUrl = 'https://taici-api.taicisou.cn';
axios.interceptors.request.use(
  config => {
    if (config.isbaseUrl) {
      config.url = config.url;
    } else {
      config.url = config.baseUrl + config.url;
    }
    if (config.loading) {
      showFullScreenLoading();
    }
    return config;
  }, err => {
    return Promise.reject(err);
  });
axios.interceptors.response.use(
  response => {
    tryHideFullScreenLoading();
    if (response.config.isbaseUrl) {
      if (response.status == 200) {
        let data = response.data.split(/\n\s\n/);
        return data;
      }
    } else {
      if (response.data.code == 200) {
        return response.data;
      } else if (response.data.status === 'OK') {
        return response.data;
      } else if (response.status == 200) {
        return response.data;
      } else {
        return response.data;
      }
    }
  },
  error => {
    let unAuthorized = false;
    tryHideFullScreenLoading();
    if (error.response) {
      switch (error.response.status) {
        case 400:
          break;
        case 401:
          unAuthorized = true;
          break;
        case 403:
          break;
        case 404:
          break;
        case 500:
          break;
      }
      if (unAuthorized) {
        Modal.error({
          title: '授权码过期，请重新登录,未授权',
          okText: '登录',
          onOk: () => {
            localStorage.clear();
            router.replace({
              path: '/login',
              query: { redirect: router.currentRoute.fullPath }
            });
          }
        });
      }
      return Promise.reject(error.response.data);
    } else {
      return Promise.reject(error);
    }
  }
);
export default axios;
