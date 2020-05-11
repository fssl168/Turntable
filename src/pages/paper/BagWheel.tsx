// @ts-ignore
import Constants from '@/utils/constants';
import classnames from 'classnames';
import { DeprecatedSystemColor, NamedColor } from 'csstype';
import { connect } from 'dva';
import LS from 'parsec-ls';
import React, { Component, RefObject } from 'react';
import router from 'umi/router';

const styles = require('./BagWheel.less');

export type GiftType = {
  type: string;
  key: number;
  id: number;
  name: string;
  title: string;
  imageUrl: string;
  subtitle: string;
};
type Color = NamedColor | DeprecatedSystemColor | "currentcolor" | string;

interface IBagWheelState {
  wheelGoods: GiftType[];
  wheelGoodsBgColors: Array<{ startColor: Color, endColor: Color }>;
  btnEnable: boolean;
  modalVisible: boolean;
  prizeType: boolean;
  errorMsg?: string;
  successMsg?: string;
  gift: any;
  formData: {
    rcvrAddress: string;
    rcvrName: string;
    rcvrPhone: string;
  };
}

@connect(({ global, loading }) => ({
  global,
  loading: loading.models.result,
}))
class BagWheel extends Component<any, IBagWheelState> {
  private timer: any;
  private loops: RefObject<HTMLDivElement> = React.createRef();
  private wheelPanel: RefObject<HTMLDivElement> = React.createRef();
  private wheelBtn: RefObject<HTMLDivElement> = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      prizeType: false,
      successMsg: '',
      errorMsg: '',
      formData: {
        rcvrName: '',
        rcvrPhone: '',
        rcvrAddress: '',
      },
      gift: {},
      wheelGoodsBgColors: [
        { startColor: '#e991f1', endColor: '#c62beb' },
        { startColor: '#fdd4db', endColor: '#f76a9e' },
        { startColor: '#64baf1', endColor: '#45adf5' },
        { startColor: '#cde3a1', endColor: '#b1da58' },
        { startColor: '#eeecbc', endColor: '#e5e833' },
      ],
      wheelGoods: [
        {
          key: 0,
          id: 1,
          name: '一等奖',
          title: '悦刻阿尔法',
          imageUrl: require('../../assets/activity/BagWheel/goods1.png'),
          subtitle: require('../../assets/activity/BagWheel/goods1.png'),
          type: 'REAL',
        },
        {
          key: 1,
          id: 2,
          name: '二等奖',
          title: '悦刻新手装',
          imageUrl: require('../../assets/activity/BagWheel/default.png'),
          subtitle: '',
          type: 'REAL',
        },
        {
          key: 2,
          id: 3,
          name: '三等奖',
          title: '悦刻烟弹',
          imageUrl: require('../../assets/activity/BagWheel/goods2.png'),
          subtitle: require('../../assets/activity/BagWheel/goods2.png'),
          type: 'REAL',
        },
        {
          key: 3,
          id: 4,
          name: '四等奖',
          title: '悦刻贴纸',
          imageUrl: require('../../assets/activity/BagWheel/default.png'),
          subtitle: '',
          type: 'REAL',
        },
        {
          key: 4,
          id: 5,
          name: '谢谢参与',
          title: '谢谢参与',
          imageUrl: require('../../assets/activity/BagWheel/goods3.png'),
          subtitle: require('../../assets/activity/BagWheel/goods3.png'),
          type: 'NONE',
        },
      ], // 大转盘物品列表
      btnEnable: true, // 防止用户频繁点击
    };
  }

  // 该方法在首次渲染之前调用(数据初始化)
  public componentWillMount = () => {
    // TODO: 调用奖品信息接口
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchRollingGifts',
      payload: {
        activityId: LS.get(Constants.activityId),
      },
      callback: res => {
        const { list } = res;
        const wheelGoods = (list || []).map((item, index) => {
          return {
            key: index,
            ...item,
          };
        });
        console.log('wheelGoods', wheelGoods);
        this.setState({
          wheelGoods,
        });
      },
    });
  };

  public render() {
    const { successMsg, errorMsg } = this.state;
    return (
      <div className={styles['bag-wheel-component']}>
        {successMsg && <div className={styles['alert-box']}>{successMsg}</div>}
        {errorMsg && (
          <div className={classnames(styles['alert-box'], styles.error)}>{errorMsg}</div>
        )}
        <div className={styles.logo}>
          <img src={require('../../assets/logo.png')} alt=""/>
        </div>
        <div className={styles['wheel-wrapper']}>
          <div className={styles['wheel-box']}>
            {/* 转盘闪环 */}
            <div className={styles['wheel-loop']} ref={this.loops}>
              {[...Array(18)].map(this.setLoopEle)}
            </div>
            {/* 转盘物品 */}
            <div className={styles['wheel-goods-box']} ref={this.wheelPanel}>
              {this.state.wheelGoods.map(this.wheelItemsEle)}
            </div>
            {/* 转盘按钮 */}
            <div className={classnames(styles['wheel-btn-box'], styles['flex-center'])}>
              <div className={classnames(styles.btn, styles['wheel-btnTop'])}/>
              <div className={classnames(styles.btn, styles['wheel-btn'])} ref={this.wheelBtn}/>
            </div>
          </div>
        </div>
        <div className={styles.wheelBtn} onClick={this.getPrize}>
          点击开始抽奖
        </div>
      </div>
    );
  }

  private setLoopEle = (datas, index) => {
    if (index % 2 === 0) {
      return (
        <i
          className={classnames(styles.loop, styles.dot2)}
          key={index}
          style={{ transform: `rotate(${index * 20}deg)` }}
        />
      );
    } else {
      return (
        <i
          className={classnames(styles.loop, styles.dot1)}
          key={index}
          style={{ transform: `rotate(${index * 20}deg)` }}
        />
      );
    }
  };

  /**
   * 点击抽奖
   */
  private getPrize = () => {
    clearTimeout(this.timer);
    if (this.state.btnEnable) {
      this.setState({ btnEnable: false }); // 禁止用户连续点击
      const { dispatch } = this.props;
    
      dispatch({
        type: 'global/fetchPrize',
        payload: {
          token: LS.get(Constants.token),
          openid: LS.get(Constants.openId),
        },
        callback: res => {
          console.log('res', res);
          if (res.code !== -1) {
            const gift = this.state.wheelGoods.filter(x => x.id === res.gift.id)[0];
            console.log('gift', gift);
            this.animation((this.state.wheelGoods.length - gift.key) * 72);
            // 动画结束后提示用户获取的奖励
            // @ts-ignore
            const goalSectorEle: React.HTMLAttributes = this.refs[`sector${res.gift.id}`];
            setTimeout(() => {
              // 指定奖品的扇形添加动画
              goalSectorEle.style.backgroundColor = '#b2d3dd';
            }, 6000);
            // 删除样式
            setTimeout(() => {
              // goalSectorEle.style.backgroundColor = 'inherit';
              // TODO 跳转到 奖品显示也面
              if (gift.type !== 'NONE') {
                router.push('/result/real');
              } else {
                router.push('/result/not-won');
              }
            }, 8000);
          } else {
            this.showMsg({ msg: res.message });
          }
        },
      });
    }
    this.timer = setTimeout(() => {
      this.setState({ btnEnable: true });
    }, 3000);
  };

  /**
   * 获取到奖品后执行动画
   * @param circle
   */
  private animation = circle => {
    // 周围小球交换显示
    const loopTime = setInterval(() => {
      const loopEle = this.loops.current.children;
      for (let i = 0; i < loopEle.length; i++) {
        if (/(dot1)/.test(loopEle[i].className)) {
          setTimeout(() => {
            loopEle[i].className = `${styles.loop} ${styles.dot2}`;
          }, 100);
        } else {
          loopEle[i].className = `${styles.loop} ${styles.dot1}`;
        }
      }
    }, 300);
    setTimeout(() => {
      clearInterval(loopTime);
    }, 6000);
    // @ts-ignore
    const wheelPanel: React.HTMLAttributes = this.wheelPanel.current;
    let initDeg = 0;
    if (wheelPanel.style.transform) {
      initDeg = wheelPanel.style.transform.replace(/[^0-9]/gi, '') * 1;
    }
    // 缓冲为6圈
    wheelPanel.style.transform = `rotate(${3600 + circle + initDeg - (initDeg % 360)}deg)`;
  };

  /******************生成标签层*********************/

  /**
   * 初始化标签方法
   * @param datas
   */
  private wheelItemsEle = (item, index) => {
    const sectorRef: string = `sector${item.id}`;
    return (
      <div className={styles['wheel-item']} key={index}>
        <div className={styles.sector}>
          <div
            className={styles.sectorCss}
            ref={sectorRef}
            style={{
              transform: `rotate(${item.key * 72 - 36}deg) skewY(-18deg)`,
            }}
          />
        </div>
        <div className={styles['wheel-goods']} style={{ transform: `rotate(${item.key * 72}deg)` }}>
          <div className={styles['wg-title']}>
            {item.title}
          </div>
          <div className={styles['wg-icon']}>
            <img src={item.imgSrc || item.subtitle} alt={item.title}/>
          </div>
        </div>
      </div>
    );
  };

  /**
   * 显示提示信息
   * @param msg
   * @param type
   */
  private showMsg = ({ msg, type = 'error' }: { msg: string; type?: string }) => {
    if (type === 'success') {
      this.setState({ successMsg: msg });
    } else {
      this.setState({ errorMsg: msg });
    }
    setTimeout(() => {
      this.setState({ errorMsg: '' });
    }, 4000);
  };
}

export default BagWheel;
