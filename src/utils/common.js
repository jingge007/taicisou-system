import {Spin} from "view-design";

// 图片尺寸  https://p0.pipi.cn/mmdb/d2dad5927e10fa51bad7c3896f4dc879a0c22.jpg?imageMogr2/thumbnail/270x400%3E
export const ImgSize = '270x400';   // 宽：270  高：400

export const handleLoading = (loading, text) => {
  if (loading) {
    Spin.show({
      render: (h) => {
        return h('div', {
          style: {
            zIndex: 8888,
            backgroundColor: '#fff',
            padding: '32px 30px',
            borderRadius: '12px'
          }
        }, [
          h('Icon', {
            'class': 'demo-spin-icon-load',
            props: {
              type: 'ios-loading',
              size: 28
            }
          }),
          h('div', {
            style: {
              marginTop: '5px',
              fontSize: '17px'
            }
          }, text || '处理中...')
        ])
      }
    });
  } else {
    Spin.hide();
  }
}