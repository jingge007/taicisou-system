<template>
  <div class="analysis_list_box">
    <Upload class="upload_box" multiple action="*" type="drag" :before-upload="handleBeforeUpload">
      <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"/>
      <p class="text">单击或拖动字幕文件上传</p>
      <span class="note_txt">*注：当前仅支持上传后缀为srt的字幕文件~~</span>
    </Upload>
    <Button type="primary" class="options_btn" size="large" @click="importBtn">导出</Button>
  </div>
</template>

<style lang="less" scoped>
.analysis_list_box {
  display: flex;
  justify-content: center;
  flex-direction: column;

  .upload_box {
    width: 60%;
    margin: 50px auto 20px;
    position: relative;

    /deep/ .ivu-upload-drag {
      padding: 30px 0;
      border: 2px dashed #c1c1c1;
      overflow: inherit;

      &:hover {
        border: 2px dashed #2d8cf0;
      }
    }

    .text {
      color: #666;
      font-size: 22px;
      margin-top: 8px;
    }

    .note_txt {
      color: #D03323;
      font-weight: bold;
      font-size: 15px;
      position: absolute;
      top: -30px;
      left: 0;
    }
  }

  .options_btn {
    width: 60%;
    margin: 0 auto;
  }

  .modalStyle {
    .ivu-modal-content {
      .model_box {
        display: flex;
        align-items: center;
        justify-content: center;

        .text_box {
          margin-left: 15px;
          display: flex;
          flex-direction: column;
          font-size: 17px;
          color: #333;
          font-weight: bold;

          .colorStyle {
            margin: 0 6px;
            font-size: 18px;
            color: #2D8CF0;
          }
        }
      }

      .footer_box {
        .ivu-btn-primary {
          padding: 0 12px;
        }
      }
    }
  }
}
</style>

<script type="text/ecmascript-6">
import axios from 'axios';
import {ImgSize} from '@/utils/common';
import {GetInstitution, GetMaoyan} from '@/api/api';
import FileSaver from 'file-saver'

export default {
  data() {
    return {
      filesData: [],
      subtitleData: []
    };
  },
  created() {
  },
  methods: {
    importBtn() {
      // 将json转换成字符串
      let data = {
        aaa: '账号：323232',
        title: '收到货收到货的发但是公司电话的发挥地方'
      };
      const blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"})
      FileSaver.saveAs(blob, `erorr.txt`)
      window.location.reload()
    },


    // bbb () {
    //   let query = {
    //     action: 'seek_all',
    //     pageNum: 0,
    //     query: '快乐'
    //   };
    //   GetInstitution(query).then((res) => {
    //     console.log('=============', res);
    //   });
    // },
    handleBeforeUpload(file) {
      this.filesData.push(file);
      return false;
    },
    // 获取字幕内容，发送一个get请求

    GetSrtInfo(srtUrl, item, info, value) {
      let _this = this;
      let movies_info = info.list[0];
      let img_url = movies_info.img.split('w.h');
      let subtitle_data = {
        title: item.name.split('.srt')[0],
        cover_url: `${img_url[0] + ImgSize + img_url[1]}`,
        subtitle: [],
        movies: movies_info
      };
      axios.get(srtUrl, {
        isbaseUrl: true
      }).then(function (response) {
        let data = response;
        if (data.length > 0) {
          data.map((item) => {
            let textItem = item.split(/\n/);
            if (textItem.length >= 4) {
              if (textItem[2].indexOf('}') > -1) {
                let cn_len = textItem[2].split('}');
                if (cn_len.length > 2) {
                  textItem[2] = cn_len[cn_len.length - 1];
                } else {
                  textItem[2] = cn_len[1];
                }
              }
              if (textItem[3].indexOf('}') > -1) {
                let es_len = textItem[3].split('}');
                if (es_len.length > 2) {
                  textItem[3] = es_len[es_len.length - 1];
                } else {
                  textItem[3] = es_len[1];
                }
              }
              let es_reg = new RegExp('[A-Za-z]+');
              let cn_reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g');
              // 当字幕数组第二行为英文的时候
              if (es_reg.test(textItem[2])) {
                let temp = textItem[2];
                textItem[2] = textItem[3];
                textItem[3] = temp;
              }
              if (!cn_reg.test(textItem[3]) && es_reg.test(textItem[3])) {
                subtitle_data.subtitle.push({
                  sort: textItem[0],
                  ch_text: textItem[2],
                  es_test: textItem[3],
                  text: (textItem[2] + textItem[3]).replace((/[a-zA-Z]/), "\n"),
                  start_time: (textItem[1].split(' --> ')[0]).split(',')[0],
                  end_time: (textItem[1].split(' --> ')[1]).split(',')[0]
                });
              }
            }
          });
        }
        _this.subtitleData.push(subtitle_data);
        _this.exportJSON(subtitle_data, movies_info.nm);
        console.log('解析之后的字幕内容', _this.subtitleData);
      }).catch(function (error) {
        console.log('-----请求失败-----', error);
      });
    },
    // 解析字幕的方法
    handerData(data) {
      let _this = this;
      if (data.length > 0) {
        data.map((item) => {
          let srtUrl = URL.createObjectURL(item);
          let title = item.name.split('.srt')[0];
          let query = {
            kw: title,
            cityId: 30,
            stype: -1
          };
          GetMaoyan(query).then((res) => {
            _this.GetSrtInfo(srtUrl, item, res.movies, data);
          });
        });
      }
    },
    // 导出台词搜字幕的数据
    exportJSON(data, title) {
      // 将json转换成字符串
      const blob = new Blob([JSON.stringify(data)], {type: ""})
      FileSaver.saveAs(blob, `${title}.json`)
      window.location.reload()
    }
  },
  watch: {
    // 监听上传解析字幕文件
    filesData: {
      handler(data) {
        this.handerData(data);
      },
      deep: true
    },
    // 监听解析成功的文件
    // subtitleData: {
    //   handler(data) {
    //     let _this = this;
    //     if (data.length === _this.filesData.length) {
    //       _this.filesData = [];
    //       _this.subtitleData = [];
    //     }
    //   }
    // }
  }
};
</script>

