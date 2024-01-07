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
      url: '/apollo/ajax/search',
      params: data
    }).then(response => {
      resolve(response);
    }).catch(err => {
      reject(err);
    });
  });
};