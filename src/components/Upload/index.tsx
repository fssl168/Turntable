import { Toast } from 'antd-mobile';
import classnames from 'classnames';
import * as qiniu from 'qiniu-js';
import React, { FocusEventHandler } from 'react';
import { polyfill } from 'react-lifecycles-compat';

const styles = require('./index.less');

type filesType = {
  url: string;
}

interface IUploadprops<T> {
  style?: T | string;
  className?: string;
  data: {
    token: string;
    domain: string;
    uploadKey?: string;
    prefix?: string;
  },
  onChange?: (value: filesType[]) => void | Promise<any>;
  onBlur?: FocusEventHandler<T>;
  placeholder?: string;
}

interface IUploadState {
  files: filesType[];
  progress: {
    loaded: number; size: number; percent: number;
  }
}

class Upload extends React.Component <IUploadprops<React.CSSProperties>, IUploadState> {

  public static defaultProps = {
    placeholder: '请选择',
    className: '',
  };

  public static getDerivedStateFromProps(nextProps: IUploadprops<React.CSSProperties>) {
    if ('data' in nextProps) {
      return {
        data: nextProps.data || {},
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      files: [],
      progress: {
        loaded: 0,
        size: 0,
        percent: 0,
      },
    };
  }

  public render() {
    const { className, placeholder } = this.props;
    const { files } = this.state;
    return (<div className={classnames(styles['upload-input-wrapper'], className)}>
      <div className={classnames(styles['image-picker-item'], {
        [styles['image-picker-upload-btn']]: files.length === 0,
      })}>
        {files.length > 0 ? files.map((img, index) => {
            return (<div key={index}>
              <div className={styles['image-picker-item-remove']} onClick={() => {
                this.setState({
                  files: [],
                  progress: {
                    size: 0,
                    percent: 0,
                    loaded: 0,
                  },
                });
              }}/>
              <div className={styles['image-picker-item-content']}>
                <img src={img.url}/>
                <div>{img.url}</div>
              </div>
            </div>);
          })
          :
          <>
            <span className={styles.placeholder}>{placeholder}</span>
            <input type='file' multiple={true} capture={false} accept='image/*' onChange={(e) => {
              e.preventDefault();
              this.uplLoadImage();
            }}/>
          </>
        }
        {
          this.state.progress.size > 0 && <div className={styles['progress-content']}>
            <div className={styles.progress}>
              <div className={styles['progress-outer']}>
                <div className={styles['progress-bar']}
                     style={{ width: `${this.state.progress.percent.toFixed(0)}%` }}/>
              </div>
            </div>
          </div>
        }
      </div>
    </div>);
  }

  private uplLoadImage = () => {
    const { data } = this.props;
    // @ts-ignore
    const file = document.querySelector('input[type=file]').files[0];
    const config = {
      useCdnDomain: true,
      disableStatisticsReport: false,
      retryCount: 6,
      region: qiniu.region.z2,
    };
    const putExtra = {
      fname: '',
      params: {},
      mimeType: null,
    };
    if (file) {
      const key = file.name;
      const observables = qiniu.upload(file, key, data.token, putExtra, config);
      const subObject = {
        next: (response) => {
          this.setState({
            progress: response.total,
          });
        },
        error: (error) => {
          console.log('error', error);
          Toast.info('上传出错');
        },
        complete: (response) => {
          console.log('complete => res.hash', response.hash);
          console.log('complete => res.bucket', response.bucket);
          if (response.key && response.key.match(/\.(jpg|jpeg|png|gif)$/)) {
            this.imageDeal(response.key, data.domain);
            console.log('response.key', response.key);
          }
        },
      };
      console.log('observables', observables);
      observables.subscribe(subObject);
    }
  };

  private imageDeal = (key, domain) => {
    const { data, onChange } = this.props;
    data.uploadKey = key;
    const { files } = this.state;
    files.push({
      url: `http://${domain}/${key}`,
    });
    console.log('this.qiNiuDataInfo', data);
    this.setState({
      files,
    });
    if (onChange) {
      onChange(files);
    }
  };
}

polyfill(Upload);

export default Upload;
