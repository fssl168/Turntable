// @ts-ignore
import {
  login,
  putPrize,
  queryActivityInfo,
  queryMyRollingTickets,
  queryQiNiuData,
  queryRollingGifts,
  queryRollingTickets,
  submitRealGiftRecord,
} from '@/services/api';
import { Toast } from 'antd-mobile';
import { routerRedux } from 'dva/router';
import LS from 'parsec-ls';

// const formatStr: string = 'YYYY-MM-DD HH:mm:ss';

export default {
  namespace: 'global',
  state: {
    chapterData: [],
    userData: {},
    rollingTicketsData: {
      id: 0,
      activityId: 0,
      token: '',
      link: null,
      playerId: 0,
      isUsed: false,
      usedAt: null,
      isWinning: null,
      isRedeemed: null,
      redeemedAt: null,
      gift: {
        id: 0,
        name: '',
        type: '',
        title: '',
        subtitle: '',
      },
      createdAt: '',
      updatedAt: '',
    },
    qiniuData: {
      token: '',
      domain: '',
    },
    realGiftRecordData: {
      createdAt: '',
      updatedAt: '',
      activityId: 0,
      token: '',
      link: '',
      phone: '',
      isUsed: true,
      isWinning: true,
      isRedeemed: true,
      id: 0,
    },
    rollingGiftsData: [],
    activityInfoData: {
      name: '',
      title: '',
      startedAt: '',
      endedAt: '',
      appId: '',
    },
    activityData: {
      activityId: 0,
      token: '',
      link: '',
      isPassedCheck: true,
      gift: {
        id: 0,
        name: '',
        type: '',
        title: '',
      },
      isUsed: true,
      isWinning: true,
      isRedeemed: true,
    },
  },
  effects: {
    * fetchLogin({ payload, callback }, { call, put }) {
      const response = yield call(login, payload);
      yield put({
        type: 'saveUserData',
        payload: response,
      });
      if (callback) {
        callback(response);
      }
    },
    * fetchQiNiuInfo(_, { call, put }) {
      const response = yield call(queryQiNiuData);
      yield put({
        type: 'saveQiNiuData',
        payload: response,
      });
    },
    * fetchRollingTickets({ payload, callback }, { call, put }) {
      // TODO 取票之前先检查我的奖品信息
      const myResponse = yield call(queryMyRollingTickets, payload);
      if (myResponse && myResponse.list && myResponse.list.length > 0) {
        if (myResponse.list[0].isUsed && myResponse.list[0].gift && myResponse.list[0].gift.id > 0) { // 已经抽奖 并且有奖品信息
          yield put(routerRedux.replace('/result/show'));
        } else if (!myResponse.list[0].isUsed) { // 没有抽奖
          if (myResponse.list[0].isRedeemed) { // 已经填写直接抽奖
            yield put(routerRedux.replace('/activity'));
          } else { // 没有填写跳转到填写资料的也面
            yield put(routerRedux.replace('/enter'));
          }
        }
      } else {
        // TODO 取票
        const response = yield call(queryRollingTickets, payload);
        yield put({
          type: 'saveRollingTicketsData',
          payload: response,
        });
        if (response.code === -1 && callback) {
          callback(response);
          return;
        }
        if (!response.isUsed) {
          yield put(routerRedux.replace('/enter'));
        }
      }
    },
    * fetchRollingGifts({ payload, callback }, { call, put }) {
      const response = yield call(queryRollingGifts, payload);
      yield put({
        type: 'saveRollingGiftsData',
        payload: response,
      });
      if (callback) {
        callback(response);
      }
    },
    * fetchMyRollingGifts({ payload, callback }, { call, put }) {
      const response = yield call(queryMyRollingTickets, payload);
      yield put({
        type: 'saveRollingTicketsData',
        payload: response.list[0] || {},
      });
      if (callback) {
        callback(response);
      }
    },
    * fetchPrize({ payload, callback }, { call, put }) {
      const response = yield call(putPrize, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) {
        callback(response);
      }
    },
    * fetchActivityInfo({ payload, callback }, { call, put }) {
      const response = yield call(queryActivityInfo, payload);
      yield put({
        type: 'saveActivityInfoData',
        payload: response,
      });
      if (callback) {
        callback(response);
      }
    },
    * submit({ payload, callback }, { put, call }) {
      Toast.loading('提交中...');
      const response = yield call(submitRealGiftRecord, payload);
      yield put({
        type: 'saveActivityData',
        payload: response || {},
      });
      Toast.hide();
      if (callback) {
        callback(response);
      }
      if (!response.isUsed) { // 奖票未使用进入抽奖的也面
        yield put(routerRedux.replace('/activity'));
      } else { // 使用了进入对应的奖品信息也面
        // TODO： 调用查询我的奖品信息接口 /app/rolling/tickets?openid=oAl2A0q9VhyVM8k1Xz_8oy0VNi0c&activityId=1
        yield put(routerRedux.replace('/result/show'));
      }
    },
  },
  reducers: {
    save(state) {
      return {
        ...state,
      };
    },
    saveRollingTicketsData(state, { payload }) {
      LS.set('token', payload.token || '');
      return {
        ...state,
        rollingTicketsData: payload,
      };
    },
    saveUserData(state, { payload }) {
      return {
        ...state,
        userData: payload,
      };
    },
    saveQiNiuData(state, { payload }) {
      return {
        ...state,
        qiniuData: payload,
      };
    },
    saveActivityData(state, { payload }) {
      LS.set('activityId', payload.activityId || 0);
      return {
        ...state,
        activityData: payload,
      };
    },
    saveActivityInfoData(state, { payload }) {
      return {
        ...state,
        activityInfoData: payload,
      };
    },
    saveRollingGiftsData(state, { payload }) {
      return {
        ...state,
        rollingGiftsData: payload.list || [],
      };
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/users') {
          dispatch({ type: 'fetch', payload: query });
        }
      });
    },
  },
};
