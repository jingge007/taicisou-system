import axios from 'axios';

/**
 * @Description: 获取猫眼的电影信息
 * @author jing
 * @date 2020/11/27
 * @params: kw: 关键词, cityId: 城市id, stype: -1
 */
export const GetMaoyan = (data) => {
  return new Promise((resolve, reject) => {
    axios({
      loading: true,
      method: 'get',
      url: '/ajax/search',
      params: data
    }).then(response => {
      resolve(response);
    }).catch(err => {
      reject(err);
    });
  });
};

/**
 * @Description: 获取小程序全局唯一后台接口调用凭据（access_token）
 * @author jing
 * @date 2020/11/27
 * @params: grant_type， appid，secret
 */

export const GetAccessToken = (data) => {
  return new Promise((resolve, reject) => {
    axios({
      loading: true,
      method: 'get',
      url: '/cgi-bin/token',
      params: data
    }).then(response => {
      resolve(response);
    }).catch(err => {
      reject(err);
    });
  });
};
/**
 * @Description: 获取小程序新增或活跃用户的画像分布数据
 * @author jing
 * @date 2020/11/27
 * @params: access_token，begin_date，end_date
 */

export const GetUserPortrait = (data, token) => {
  return new Promise((resolve, reject) => {
    axios({
      loading: true,
      method: 'post',
      url: `/datacube/getweanalysisappidvisitdistribution?access_token=${token}`,
      data: data
    }).then(response => {
      resolve(response);
    }).catch(err => {
      reject(err);
    });
  });
};