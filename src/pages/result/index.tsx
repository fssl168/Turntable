// @ts-ignore
import Constants from '@/utils/constants';
import { connect } from 'dva';
import _ from 'lodash';
import LS from 'parsec-ls';
import React, { RefObject } from 'react';
import router from 'umi/router';
import { GiftType } from '../paper/BagWheel';

const styles = require('./index.less');

interface IProps {
  global: {
    rollingGiftsData: GiftType[];
    rollingTicketsData: {
      gift: GiftType;
    };
  };
  dispatch: any;
}

interface IResultState {
  mainDom?: RefObject<HTMLDivElement>;
  resultSrc: string;
  type: string;
  resultData: Array<{
    title: string;
    code: string;
    imageUrl: string;
    prizeImg?: string;
    subtitle: string | React.ReactNode;
  }>;
}

@connect(({ global, loading }) => ({
  global,
  loading: loading.models.global,
}))
class Result extends React.PureComponent<IProps, IResultState> {
  constructor(props) {
    super(props);
    this.state = {
      resultSrc: '',
      type: props.match.params.type,
      mainDom: React.createRef(),
      resultData: [
        {
          title: '一等奖',
          code: 'first-prize',
          imageUrl: require('../../assets/result/first-prize-bg.png'),
          subtitle: '悦刻阿尔法套装×1盒',
          prizeImg: require('../../assets/result/first-prize.png'),
        },
        {
          title: '二等奖',
          code: 'second-prize',
          imageUrl: require('../../assets/result/second-prize-bg.png'),
          subtitle: '悦刻套装×1盒',
          prizeImg: require('../../assets/result/second-prize.png'),
        },
        {
          title: '三等奖',
          code: 'third-prize',
          imageUrl: require('../../assets/result/third-prize-bg.png'),
          subtitle: (
            <span>
              悦刻三连装烟弹×1盒
              <br />
              （口味随机）
            </span>
          ),
          prizeImg: require('../../assets/result/third-prize.png'),
        },
        {
          title: '四等奖',
          code: 'fourth-prize',
          imageUrl: require('../../assets/result/fourth-prize-bg.png'),
          subtitle: (
            <span>
              悦刻贴纸×1张
              <br />
              （样式随机）
            </span>
          ),
          prizeImg: require('../../assets/result/fourth-prize.png'),
        },
        {
          title: '谢谢参与',
          code: 'not-won',
          imageUrl: require('../../assets/result/fourth-prize-bg.png'),
          subtitle: '',
          prizeImg: '',
        },
        {
          title: '展示中奖信息',
          code: 'show',
          imageUrl: '',
          subtitle: '',
        },
      ],
    };
  }

  public componentWillMount = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchRollingGifts',
      payload: {
        activityId: LS.get(Constants.activityId),
      },
    });
    dispatch({
      type: 'global/fetchMyRollingGifts',
      payload: {
        openid: LS.get(Constants.openId),
        activityId: LS.get(Constants.activityId),
      },
      callback: res => {
        console.log('res', res);
      },
    });
  };

  public render = () => {
    const { mainDom, type } = this.state;
  
    const {
      global: { rollingGiftsData = [], rollingTicketsData },
    } = this.props;
    let gift: GiftType = {
      key: 0,
      id: 0,
      name: '',
      title: '',
      imageUrl: '',
      subtitle: '',
      type: '',
    };
    let defualtBgUrl: string = require('../../assets/result/fourth-prize-bg.png');
    let title: string = '谢谢参与';
    let desc: string = '';
    if (rollingTicketsData.gift && rollingTicketsData.gift.id) {
      title = rollingTicketsData.gift.name;
      gift = rollingGiftsData.filter(x => x.id === rollingTicketsData.gift.id)[0];
      console.log('gift', gift);
      if (_.startsWith(title, '一')) {
        defualtBgUrl = require('../../assets/result/first-prize-bg.png');
      } else if (_.startsWith(title, '二')) {
        defualtBgUrl = require('../../assets/result/second-prize-bg.png');
      } else if (_.startsWith(title, '三')) {
        defualtBgUrl = require('../../assets/result/third-prize-bg.png');
      } else if (_.startsWith(title, '四')) {
        defualtBgUrl = require('../../assets/result/fourth-prize-bg.png');
        desc = '注：四等奖需在您购买RELX产品的线下零售店领取';
      } else {
        defualtBgUrl = require('../../assets/result/fourth-prize-bg.png');
      }
    }

    if (type === 'show') {
      console.log('gift', rollingTicketsData.gift);
      if (rollingTicketsData.gift.type !== undefined && rollingTicketsData.gift.type === 'NONE') {
        return (
          <React.Fragment>
            <div
              className={styles.result}
              onTouchStart={() => {
                return false;
              }}
            >
              <div className={styles.domain} ref={mainDom}>
                <div
                  className={styles['result-content-wrapper']}
                  style={{ backgroundImage: `url(${defualtBgUrl})` }}
                >
                  <div className={styles['result-content']}>
                    <div className={styles.title}>{title}</div>
                  </div>
                  <div
                    className={styles.goHomeBtn}
                    onClick={() => {
                    
                      router.push('/');
                    }}
                  >
                    返回首页
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      } else {
        return (
          <React.Fragment>
            <div
              className={styles.result}
              onTouchStart={() => {
                return false;
              }}
            >
              <div className={styles.domain} ref={mainDom}>
                <div className={styles.logo}>
                  <img src={require('../../assets/logo.png')} alt="" />
                </div>
                <div className={styles['result-content']}>
                  <div className={styles.title}>
                    您已参与过抽奖
                    <br />
                    您获得的奖品是
                  </div>
                  {gift.imageUrl && (
                    <img className={styles['prize-img']} src={gift.imageUrl || ''} alt="" />
                  )}
                  {/*<div className={styles.tip}>*/}
                  {/*  <p>奖品将在活动结束后15个工作日内发出</p>*/}
                  {/*  <p>请耐心等待</p>*/}
                  {/*</div>*/}
                  <div className={styles.desc} style={{ color: '#000' }}>
                    {desc}
                  </div>
                  <div
                    className={styles.goHomeBtn}
                    onClick={() => {
                      _czc.push(['_trackEvent', '已参与反馈', '返回首页', '', '', '']);
                      router.push('/');
                    }}
                  >
                    返回首页
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      }
    }

    return (
      <React.Fragment>
        <div
          className={styles.result}
          onTouchStart={() => {
            return false;
          }}
        >
          <div className={styles.domain} ref={mainDom}>
            <div
              className={styles['result-content-wrapper']}
              style={{ backgroundImage: `url(${defualtBgUrl})` }}
            >
              <div className={styles['result-content']}>
                <div className={styles.title}>{title}</div>
                {gift.imageUrl !== '' && (
                  <img className={styles['prize-img']} src={gift.imageUrl || ''} alt="" />
                )}
                {gift.subtitle !== '' && (
                  <div className={styles.subtitle}>{gift.subtitle || ''}</div>
                )}
              </div>
              <div className={styles.desc}>{desc}</div>
              <div
                className={styles.goHomeBtn}
                onClick={() => {
                
                  router.push('/');
                }}
              >
                返回首页
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };
}

export default Result;
