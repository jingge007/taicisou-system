import Vue from 'vue';
import Router from 'vue-router';
import {routeConfig} from '@/utils/navConfig';

Vue.use(Router);
const router = new Router({
  mode: 'hash', // history
  routes: [
    {
      path: '/',
      redirect: '/analysis_list',
      component: () => import('@/components/baseMain'),
      children: routeConfig
    }
  ],
  base: process.env.BASE_URL,
});
export default router;