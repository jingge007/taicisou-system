import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
const router = new Router({
  mode: 'hash', // history
  routes: [
    {
      path: '/',
      redirect: '/analysis_list',
      component: () => import('@/components/baseMain'),
      children: [
        {
          path: '/analysis_list',
          name: 'analysis_list',
          component: () => import('@/views/analysis_list'),
          meta: {
            title: '解析文件',
            requireAuth: true
          }
        },
        {
          path: '/todayLinesData',
          name: 'todayLinesData',
          component: () => import('@/views/todayLinesData'),
          meta: {
            title: '经典台词',
            requireAuth: true
          }
        },
        {
          path: '/movie_subtitles',
          name: 'movie_subtitles',
          component: () => import('@/views/movie_subtitles'),
          meta: {
            title: '电影字幕',
            requireAuth: true
          }
        },
        {
          path: '/tv_subtitles',
          name: 'tv_subtitles',
          component: () => import('@/views/tv_subtitles'),
          meta: {
            title: '电视剧字幕',
            requireAuth: true
          }
        },
        {
          path: '/user_info',
          name: 'user_info',
          component: () => import('@/views/user_info'),
          meta: {
            title: '用户信息列表',
            requireAuth: true
          }
        }
      ]
    }
  ]
});
export default router;