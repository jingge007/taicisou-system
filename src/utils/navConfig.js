// 导航菜单和路由配置
export const navConfig = [
  {
    icon: 'icon-jiexi',
    singlePage: true,
    icon_size: '20px',
    size: '28px',
    name: 'analysis_list',
    title: '字幕台词数据处理',
    path: '/analysis_list',
    component: () => import('@/views/analysis_list'),
    meta: {
      title: '字幕台词数据处理',
      requireAuth: true
    }
  },
  {
    icon: 'icon-jiexi',
    singlePage: true,
    icon_size: '20px',
    size: '28px',
    name: 'classicLineData',
    title: '经典台词数据处理',
    path: '/classicLineData',
    component: () => import('@/views/classicLineData'),
    meta: {
      title: '经典台词数据处理',
      requireAuth: true
    }
  },
  {
    icon: 'icon-mingrenyulu',
    singlePage: true,
    icon_size: '20px',
    size: '26px',
    name: 'todayLinesData',
    title: '经典台词',
    path: '/todayLinesData',
    component: () => import('@/views/todayLinesData'),
    meta: {
      title: '经典台词',
      requireAuth: true
    }
  },
  {
    icon: 'icon-dianying',
    singlePage: true,
    icon_size: '18px',
    size: '23px',
    name: 'movie_subtitles',
    title: '电影字幕',
    path: '/movie_subtitles',
    component: () => import('@/views/movie_subtitles'),
    meta: {
      title: '电影字幕',
      requireAuth: true
    }
  },
  {
    icon: 'icon-dianshiju',
    singlePage: true,
    size: '26px',
    icon_size: '22px',
    name: 'tv_subtitles',
    title: '电视剧字幕',
    path: '/tv_subtitles',
    component: () => import('@/views/tv_subtitles'),
    meta: {
      title: '电视剧字幕',
      requireAuth: true
    }
  },
  {
    icon: 'icon-yonghuxinxi',
    singlePage: true,
    icon_size: '20px',
    size: '26px',
    name: 'user_info',
    title: '用户信息列表',
    path: '/user_info',
    component: () => import('@/views/user_info'),
    meta: {
      title: '用户信息列表',
      requireAuth: true
    }
  }
];

// 提取菜单配置
export const menuConfig = navConfig.map(item => ({
  icon: item.icon,
  singlePage: item.singlePage,
  icon_size: item.icon_size,
  size: item.size,
  name: item.name,
  title: item.title
}));

// 提取路由配置
export const routeConfig = navConfig.map(item => ({
  path: item.path,
  name: item.name,
  component: item.component,
  meta: item.meta
}));
