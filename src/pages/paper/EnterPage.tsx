// @ts-ignore
import Constants from '@/utils/constants';
import { Picker } from 'antd-mobile';
import { district } from 'antd-mobile-demo-data';
import arrayTreeFilter from 'array-tree-filter';
import classnames from 'classnames';
import { connect } from 'dva';
import LS from 'parsec-ls';
import React from 'react';
import UploadInput from '../../components/Upload';

const styles = require('./EnterPage.less');

// 如果不是使用 List.Item 作为 children
const CustomChildren = props => (
  <div
    onClick={props.onClick}
    className={styles.input}
  >
    {props.children ? <span>{props.children}</span> : <span className={styles.placeholder}>{props.extra}</span>}
  </div>
);


interface IProps {
  dispatch: any;
  global: {
    qiniuData: {
      token: string;
      domain: string;
    }
  }
}

interface IState {
  rcvrName: string;
  rcvrPhone: string;
  rcvrProvincialCityValue: Array<string | number>;
  rcvrProvincialCityLabel: string;
  rcvrAddress: string;
  rcvrPhotoUrl: string;
  errorMsg: string;
  successMsg: string;
  resultData: Array<{
    minScore: number;
    maxScore: number;
    info: Array<{
      gender: 0 | 1;
      title: string;
      src: string;
    }>;
  }>;
}

@connect(({ global, loading }) => ({
  global,
  loading: loading.models.global,
}))
class EnterPage extends React.Component<IProps, IState> {
  public static defaultProps = {
    qiniuData: {
      token: '',
      domain: '',
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      rcvrName: '',
      rcvrPhone: '',
      rcvrProvincialCityValue: [],
      rcvrProvincialCityLabel: '',
      rcvrAddress: '',
      rcvrPhotoUrl: '',
      successMsg: '',
      errorMsg: '',
      resultData: [],
    };
  }

  public componentWillMount(): void {
    this.getQiNiuInfo();
  }

  public render() {
    const { successMsg, errorMsg, rcvrName, rcvrPhone, rcvrProvincialCityValue, rcvrProvincialCityLabel, rcvrAddress, rcvrPhotoUrl } = this.state;
    const { global: { qiniuData } } = this.props;
    return (
      <div
        className={styles['enter-page-component']}
        onTouchStart={() => {
          return false;
        }}
      >
        {successMsg && <div className={styles['alert-box']}>{successMsg}</div>}
        {errorMsg && (
          <div className={classnames(styles['alert-box'], styles.error)}>{errorMsg}</div>
        )}
        <div className={styles.logo}>
          <img src={require('../../assets/logo.png')} alt=""/>
        </div>
        <div className={styles.prompt}>

          <p>请填写以下信息后参与抽奖</p>
          <p>奖品将在活动结束后15个工作日内发出</p>
        </div>
        <div className={styles.form}>
          <div className={styles['form-item']}>
            <div className={styles['item-input']}>
              <input
                type="text"
                placeholder={'姓名'}
                onChange={e => {
                  this.setState({
                    rcvrName: e.target.value,
                    rcvrPhone,
                    rcvrProvincialCityLabel,
                    rcvrProvincialCityValue,
                    rcvrAddress,
                    rcvrPhotoUrl,
                    errorMsg: '',
                    successMsg: '',
                  });
                }}
                onBlur={() => {
                  window.scrollTo(0, 0);
                }}
              />
            </div>
          </div>
          <div className={styles['form-item']}>
            <div className={styles['item-input']}>
              <input
                type="number"
                placeholder={'联系电话'}
                pattern={'[0-9]*'}
                onChange={e => {
                  this.setState({
                    rcvrPhone: e.target.value,
                    rcvrName,
                    rcvrProvincialCityLabel,
                    rcvrProvincialCityValue,
                    rcvrAddress,
                    rcvrPhotoUrl,
                    errorMsg: '',
                    successMsg: '',
                  });
                }}
                onBlur={() => {
                  window.scrollTo(0, 0);
                }}
              />
            </div>
          </div>

          <div className={styles['form-item']}>
            <div className={styles['item-input']}>
              <Picker extra="请选择省份/城市"
                      data={district}
                      title="省份/城市"
                      value={rcvrProvincialCityValue}
                      onOk={e => {
                        console.log('e', e);
                        this.setState({
                          rcvrAddress,
                          rcvrName,
                          rcvrProvincialCityLabel,
                          rcvrPhone,
                          rcvrPhotoUrl,
                          errorMsg: '',
                          successMsg: '',
                          rcvrProvincialCityValue: e,
                        }, () => {
                          const labels = this.getSel();
                          console.log('labels', labels);
                          this.setState({
                            rcvrAddress,
                            rcvrName,
                            rcvrProvincialCityValue,
                            rcvrPhone,
                            rcvrPhotoUrl,
                            errorMsg: '',
                            successMsg: '',
                            rcvrProvincialCityLabel: labels,
                          });
                        });
                      }}
              >
                <CustomChildren className={styles.input}>
                  {rcvrProvincialCityLabel.length > 0 ? <span>{rcvrProvincialCityLabel}</span> :
                    <span className={styles.placeholder}>请选择省份/城市</span>}
                </CustomChildren>
              </Picker>
            </div>
          </div>
          <div className={styles['form-item']}>
            <div className={styles['item-input']}>
              <input
                type="text"
                placeholder={'详细地址'}
                onChange={e => {
                  this.setState({
                    rcvrAddress: e.target.value,
                    rcvrName,
                    rcvrProvincialCityLabel,
                    rcvrProvincialCityValue,
                    rcvrPhone,
                    rcvrPhotoUrl,
                    errorMsg: '',
                    successMsg: '',
                  });
                }}
                onBlur={() => {
                  window.scrollTo(0, 0);
                }}
              />
            </div>
          </div>

          <div className={styles['form-item']}>
            <div className={styles['item-input']}>
              <UploadInput className={styles.input} data={qiniuData} placeholder={'上传RELX 产品照片'} onBlur={() => {
                window.scrollTo(0, 0);
              }} onChange={(value) => {
                this.setState({
                  rcvrName,
                  rcvrPhone,
                  rcvrProvincialCityLabel,
                  rcvrProvincialCityValue,
                  rcvrAddress,
                  rcvrPhotoUrl: value[0].url || '',
                  errorMsg: '',
                  successMsg: '',
                });
              }}/>
            </div>
          </div>

          <div className={styles['form-item']}>
            <div
              className={styles.inputBtn}
              onClick={() => {
                this.handleSubmit();
              }}
            >
              确认提交
            </div>
          </div>
        </div>
      </div>
    );
  }

  private handleSubmit = () => {
    const { rcvrName, rcvrAddress, rcvrPhotoUrl, rcvrPhone, rcvrProvincialCityLabel } = this.state;

    if (rcvrName.length === 0) {
      this.showMsg({ msg: '请填写姓名' });
      return;
    }
    if (rcvrPhone.length === 0) {
      this.showMsg({ msg: '请填写手机号' });
      return;
    }

    if (rcvrPhone.length === 0) {
      this.showMsg({ msg: '请填写手机号' });
      return;
    }
    if (
      !new RegExp('^0?(13[0-9]|14[579]|15[0-35-9]|16[6]|17[0135678]|18[0-9]|19[89])\\d{8}$').test(
        rcvrPhone,
      )
    ) {
      this.showMsg({ msg: '请输入正确的手机号码' });
      return;
    }
    if (rcvrProvincialCityLabel.length === 0) {
      this.showMsg({ msg: '请填选择省份/城市' });
      return;
    }
    if (rcvrAddress.length === 0) {
      this.showMsg({ msg: '请填写详细地址' });
      return;
    }
    if (rcvrPhotoUrl.length === 0) {
      this.showMsg({ msg: '请上传照片' });
      return;
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'global/submit',
      payload: {
        rcvrName,
        rcvrPhone,
        rcvrAddress: `${rcvrProvincialCityLabel} ${rcvrAddress}`,
        rcvrPhotoUrl,
        openid: LS.get(Constants.openId),
        token: LS.get(Constants.token),
      },
      callback: response => {
        LS.set('phone', rcvrPhone);
        if (response) {
          this.showMsg({ msg: '提交成功', type: 'success' });
        } else {
          this.showMsg({ msg: response.message });
        }
      },
    });
  };

  private getQiNiuInfo = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchQiNiuInfo',
    });
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


  private getSel = () => {
    const value = this.state.rcvrProvincialCityValue;
    if (!value) {
      return '';
    }
    // @ts-ignore
    const treeChildren = arrayTreeFilter(district, (c, level) => c.value === value[level]);
    // @ts-ignore
    return treeChildren.map(v => v.label).join('/');
  };
}

export default EnterPage;
