// @ts-ignore
import request from '@/utils/request';
import { stringify } from 'qs';


const host = process.env.NODE_ENV === 'development' ? '/api' : 'http://localhost:8080'; //你服务器的地址

/**
 * 玩家登录注册
 * @param params
 */
export async function login(params) {
  return request(`${host}/app/games/${params.activityId}/players/${params.openid}`);
}


/**
 * 查询活动信息
 * @param params
 */
export async function queryActivityInfo(params) {
  return request(`${host}/app/games/${params.activityId}`);
}


/**
 * 获取奖品信息
 * @param params
 */
export async function queryRollingGifts(params) {
  return request(`${host}/app/rolling/gifts/${params.activityId}`);
}


/**
 * 取票
 * @param params
 */
export async function queryRollingTickets(params) {
  return request(`${host}/app/rolling/tickets`, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

/**
 * 我的奖票信息
 * @param params
 */
export async function queryMyRollingTickets(params) {
  return request(`${host}/app/rolling/tickets?${stringify(params)}`);
}



/**
 * 抽奖  /app/rolling/tickets/:token/roll
 * @param params
 */
export async function putPrize(params) {
  return request(`${host}/app/rolling/tickets/${params.token}/roll`, {
    method: 'PUT',
    body: {
      ...params,
    },
  });
}


/**
 * 兑奖
 * @param params
 */
export async function submitRealGiftRecord(params) {
  return request(`${host}/app/rolling/tickets/${params.token}/redeem`, {
    method: 'PUT',
    body: {
      ...params,
    },
  });
}


/**
 * 获取七牛上传参数
 */
export async function queryQiNiuData() {
  return request('http://localhost:8080'); // 文件服务器上传地址
}
