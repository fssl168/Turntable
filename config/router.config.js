export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
    ],
  },
  // H5
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    authority: ['user', 'admin'],
    routes: [
      { path: '/', component: './paper/index', title: 'RELX幸运大转盘' },
      { path: '/enter', component: './paper/EnterPage', title: 'RELX幸运大转盘' },
      { path: '/activity', component: './paper/BagWheel', title: 'RELX幸运大转盘' },
      { path: '/result/:type', component: './result/index', title: 'RELX幸运大转盘' },
      {
        title: 'exception',
        path: '/exception',
        routes: [
          // Exception
          {
            path: '/exception/403',
            title: 'not-permission',
            component: './exception/403',
          },
          {
            path: '/exception/404',
            title: 'not-find',
            component: './exception/404',
          },
          {
            path: '/exception/500',
            title: 'server-error',
            component: './exception/500',
          },
        ],
      },
      { path: '/404', component: '404' },
    ],
  },
];
