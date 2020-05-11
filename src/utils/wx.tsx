// @ts-ignore
import Constants from '@/utils/constants';
// @ts-ignore
import request from '@/utils/request';
import LS from 'parsec-ls';
import { parse } from 'qs';
import wx from 'weixin-js-sdk';

let ready;
const readyFn = (() => new Promise(resolve => (ready = resolve)))();

export async function share(title, desc, link, imgUrl, success?) {
  await readyFn;
  // 朋友圈
  wx.onMenuShareTimeline({
    title, //  分享标题
    link, //  分享链接
    imgUrl, //  分享图标
    success,
  });
  // 分享给朋友
  wx.onMenuShareAppMessage({
    title, //  分享标题
    desc, //  分享描述
    link, //  分享链接
    imgUrl, //  分享图标
    success,
  });
  // QQ
  wx.onMenuShareQQ({
    title, //  分享标题
    desc, //  分享描述
    link, //  分享链接
    imgUrl, //  分享图标
    success,
  });
  // 腾讯微博
  wx.onMenuShareWeibo({
    title, //  分享标题
    desc, //  分享描述
    link, //  分享链接
    imgUrl, //  分享图标
    success,
  });
  // QQ空间
  wx.onMenuShareQZone({
    title, //  分享标题
    desc, //  分享描述
    link, //  分享链接
    imgUrl, //  分享图标
    success,
  });
}

export async function getLocation(callback) {
  await readyFn;
  wx.getLocation({
    type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
    success: async res => {
      if (callback) {
        await callback(res);
      }
    },
  });
}

export default async ({
                        title = document.title,
                        desc = title,
                        link = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`,
                        imgUrl = '',
                        openid = parse(window.location.search.replace('?', '')).openid || LS.get(Constants.openId),
                        appId = '',
                        isNeedLogin = false,
} = {}) => {
  if ((openid === undefined || openid === null) && isNeedLogin && process.env.NODE_ENV === 'production') {
    const doLogin = async () => {
      await request('https://third.parsec.com.cn/api/wxuser/auth', {
          method: 'POST',
          body: {
            appid: appId,
            redirect_uri: window.location.href,
            return_token: 0,
          },
        },
      ).then(({ result: { url } }) => {
        // @ts-ignore
        window.location.replace(url);
      });
    };
    await doLogin();
    return;
  } else {
    LS.set(Constants.openId, openid);
    let { href } = window.location;
    href = href.replace(`openid=${openid}&appid=${appId}`, '');
    if (window.location.href !== href) {
      window.location.replace(href);
      return Promise.resolve();
    }
  }

  await request(`https://third.parsec.com.cn/api/js_ticket`, {
      method: 'POST',
      body: {
        appid: appId,
        url: window.location.href,
      },
    },
  ).then(({ result }) => {
    wx.config({
      debug: false,
      jsApiList: Object.keys(wx),
      ...result,
    });
  });
  wx.error(e => {
    console.log('wx sdk errors:', e);
  });
  wx.ready(() => {
    ready();
    share(title, desc, link, imgUrl);
    // getLocation(res => {
    //   console.log('getLocation ==== > res', res);
    //   console.log('getLocation ==== > res.latitude', res.latitude); // 纬度，浮点数，范围为90 ~ -90
    //   console.log('getLocation ==== > res.longitude', res.longitude); // 经度，浮点数，范围为180 ~ -180。
    //   console.log('getLocation ==== > res.speed', res.speed); // 速度，以米/每秒计
    //   console.log('getLocation ==== > res.accuracy', res.accuracy); // 位置精度
    //   LS.set(Constants.latitude, res.latitude);
    //   LS.set(Constants.longitude, res.longitude);
    // });
  });
  return true;
};
