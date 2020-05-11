// @ts-ignore
import Constants from '@/utils/constants';
import { Modal } from 'antd-mobile';
import classnames from 'classnames';
import { connect } from 'dva';
import LS from 'parsec-ls';
import moment from 'moment/moment';
import React from 'react';
import Loadding from '../../components/PageLoading/index';

const styles = require('./index.less');

@connect(({ global, loading }) => ({
  global,
  loading: loading.models.global,
}))
class Index extends React.Component<any, any> {
  public static getDerivedStateFromProps(nextProps) {
    if ('global' in nextProps) {
      return {
        rollingTicketsData: nextProps.global.rollingTicketsData || {},
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      isActivityState: true,
    };
  }


  public componentDidMount(): void {
    this.initPage();
    this.getAvtivityInfo();
  }

  public render() {
    const { loadding, global: { activityInfoData } } = this.props;
    if (loadding) {
      return <Loadding />;
    }
    return (
      <div
        className={classnames('index-component', styles.home)}
        onTouchStart={() => {
          return false;
        }}
      >
        <div className={styles.logo}>
          <img src={require('../../assets/logo.png')} alt=""/>
        </div>
        <div className={styles.container}>
          <div className={styles.title}>
            <img src={require('../../assets/title.png')} alt=""/>
          </div>
          <h4>严禁向未成年人推荐或销售电子烟</h4>
          <div className={styles.text}>
            <p>为了答谢您为倡导「守护者计划」作出贡献</p>
            <p>悦刻给您准备了一次幸运抽奖机会！</p>
          </div>
          <div
            className={styles.btn}
            onClick={() => {
              if (moment(moment(activityInfoData.startedAt).format('YYYY-MM-DD HH:mm:ss')).isAfter(moment().format('YYYY-MM-DD HH:mm:ss'))) {
                Modal.alert('感谢您的参与', '活动尚未开始哦！');
                return;
              }
              if (moment(moment(activityInfoData.endedAt).format('YYYY-MM-DD HH:mm:ss')).isBefore(moment().format('YYYY-MM-DD HH:mm:ss'))) {
                Modal.alert('感谢您的参与', '活动已经结束了！');
                return;
              }
              this.getRollingTickets();
            }}
          >点击参与抽奖
          </div>
          <p
            className={styles['activity-time']}>活动时间：{moment(activityInfoData.startedAt).format('YYYY年MM月DD日')} - {moment(activityInfoData.endedAt).format('MM月DD日')}</p>
        </div>
      </div>
    );
  }

  /**
   * 初始化用户登录注册
   */
  private initPage = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchLogin',
      payload: {
        openid: LS.get(Constants.openId),
        activityId: LS.get(Constants.activityId),
      },
      callback: (res) => {
        if (res.code === -1) {
          console.log('=>', res.message);
          // Modal.alert('活动提示', '活动尚未开始哦');
          this.setState({
            isActivityState: false,
          });
        } else {
          this.setState({
            isActivityState: true,
          });
        }
      },
    });
  };

  /**
   * 查询活动信息
   */
  private getAvtivityInfo = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchActivityInfo',
      payload: {
        activityId: LS.get(Constants.activityId),
      },
    });
  };

  /**
   * 取票
   */
  private getRollingTickets = () => {
    const { dispatch } = this.props;
    _czc.push(['_trackEvent', '主业务', '点击参与', '', '', '']);
    dispatch({
      type: 'global/fetchRollingTickets',
      payload: {
        activityId: LS.get(Constants.activityId),
        openid: LS.get(Constants.openId),
      },
      callback: (res) => {
        if (res.code === -1) {
          console.log('取票 ===> ', res.message);
          Modal.alert('活动提示', '你已经参与过了,感谢您的参与');
        }
      },
    });
  };
}

export default Index;
