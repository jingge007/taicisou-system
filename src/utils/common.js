import {Spin} from "view-design";

// 图片尺寸  https://p0.pipi.cn/mmdb/d2dad5927e10fa51bad7c3896f4dc879a0c22.jpg?imageMogr2/thumbnail/270x400%3E
export const ImgSize = '270x400';   // 宽：270  高：400

export const handleLoading = (loading, text) => {
  if (loading) {
    Spin.show({
      render: (h) => {
        return h('div', [
          h('Icon', {
            'class': 'demo-spin-icon-load',
            props: {
              type: 'ios-loading',
              size: 18
            }
          }),
          h('div', text)
        ])
      }
    });
  } else {
    Spin.hide();
  }
}
