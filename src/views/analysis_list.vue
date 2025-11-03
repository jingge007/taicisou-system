<template>
  <div>
    <div class="analysis_list_box">
      <Upload class="upload_box" multiple action="*" type="drag" :before-upload="handleBeforeUpload">
        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"/>
        <p class="text">单击或拖动字幕文件上传</p>
        <span class="note_txt">*注：当前仅支持上传后缀为srt的字幕文件~~</span>
      </Upload>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import axios from 'axios';
import {handleLoading, ImgSize} from '@/utils/common';
import {GetMaoyan} from '@/api/api';
import FileSaver from 'file-saver';
import srtParser2 from "srt-parser-2";

export default {
  data() {
    return {
      filesData: [],
      subtitleData: [],
    };
  },
  created() {
  },
  methods: {
    handleBeforeUpload(file) {
      let v = this;
      v.subtitleData = [];
      const isSRT = file.name.toLowerCase().endsWith('.srt');
      if (!isSRT) {
        this.$Message.error('只能上传.srt格式的文件');
      } else {
        v.filesData.push(file);
        setTimeout(() => {
          v.$Modal.confirm({
            title: '上传文件成功',
            content: `已经成功上传${v.filesData.length}个文件，是否处理字幕文件数据？`,
            onOk: () => {
              v.handerData(v.filesData);
              setTimeout(() => {
                v.filesData = [];
              }, 2000);
            },
            onCancel: () => {
              v.filesData = [];
            },
          });
        }, 1000);
      }
      return false;
    },
    // 获取字幕电影的相关基本信息
    handerData(data) {
      let _this = this;
      if (data.length > 0) {
        handleLoading(true, '处理字幕数据中...');
        data.map((item, index) => {
          let srtUrl = URL.createObjectURL(item);
          let title = item.name.split('.srt')[0] || item.name.split('.ass')[0];
          let query = {
            kw: title,
            cityId: 30,
            stype: -1,
            WuKongReady: 'h5'
          };
          GetMaoyan(query).then((res) => {
            if (res.movies) {
              _this.GetSrtInfo(srtUrl, item, res.movies, data, index);
            } else {
              console.log(`获取电影字幕信息失败：=========${item.name}========`, res)
            }
          }).catch((error) => {
            console.log(`获取电影字幕信息失败：=========${item.name}========`, error)
          });
        });
      }
    },
    // 获取字幕内容，发送一个get请求
    GetSrtInfo(srtUrl, item, info, originData, currentIndex) {
      let _this = this;
      let fileExtension = item.name.split('.')[1];
      let movies_info = info.list[0];
      let img_url = movies_info.img.replace(/thumbnail\/\d+x\d+/, `thumbnail/${ImgSize}`);
      let subtitle_data = {
        title: movies_info.nm,
        coverUrl: img_url,
        moviesInfo: movies_info,
        id: movies_info.id
      };
      let newList = [];
      axios.get(srtUrl, {isbaseUrl: true}).then(function (response) {
        if (response) {
          let data = response || [];
          if (data.length > 0) {
            data.map((item) => {
              let obj = _this.handleSrtSubtitlesData(item);
              newList.push(...obj);
            });
            if (newList.length > 0) {
              newList.map((item, index) => {
                let currentIndex = index + 1;
                item['subtitleId'] = movies_info.id + '-' + currentIndex;
                item['moviesInfo'] = subtitle_data;
                item['title'] = movies_info.nm;
                item.movieId = movies_info.id;
                item.coverUrl = img_url;
              })
            }
            _this.subtitleData.push(...newList);

            if (currentIndex >= originData.length - 1) {
              handleLoading(false);
              _this.$Modal.confirm({
                title: '字幕文件数据已经全部处理完毕',
                content: `总处理了 ${originData.length} 条字幕文件数据，是否将字幕文件数据上传到leancloud？`,
                onOk: () => {
                  // _this.uploadSubtitleData(_this.subtitleData)
                  _this.exportJSON(_this.subtitleData, 'subtitleData');
                },
                onCancel: () => {
                  _this.subtitleData = [];
                },
              });
            }
          }
          // console.log('解析之后的字幕内容', _this.subtitleData);
        }
      }).catch(function (error) {
        console.log('-----请求失败-----', error);
      });
    },
    // 解析srt字幕文件的方法
    handleSrtSubtitlesData(subtitleFile) {
      // 使用 srtParser2 解析SRT文件
      const parser = new srtParser2();
      const subtitlesData = parser.fromSrt(subtitleFile);
      // 过滤掉包含特殊符号的字幕
      const filteredSubtitlesData = subtitlesData.filter((item) => {
        // 过滤掉包含特殊符号的字幕
        return !item.text.includes('{\\') && // 过滤掉所有包含 {\ 的标记
          !item.text.includes('�') &&  // 过滤掉乱码字符
          !item.text.includes('♪') &&  // 过滤掉音乐符号
          !item.text.includes('{\\fs') && // 过滤掉字体大小标记
          !item.text.includes('{\\an') && // 过滤掉对齐标记
          !item.text.includes('{\\fad'); // 过滤掉淡入淡出标记
      }).map((ele, index) => {
        // 处理字幕文本，通常SRT字幕文件中的文本是双行的（如中英双语）
        let text = ele.text.split('\n');
        // 返回处理后的字幕数据
        if (text[0] && text[1]) {
          return {
            zhContent: text[0].trim(), // 第一行通常是中文
            esContent: text[1].trim(), // 第二行通常是西班牙文
            content: ele.text.trim(),  // 原始字幕内容
            startTime: ele.startTime,  // 字幕开始时间
            endTime: ele.endTime       // 字幕结束时间
          };
        }
      });

      // 过滤掉 undefined 的条目
      let newList = filteredSubtitlesData.filter(item => item !== undefined);
      return newList;
    },
    // 导出台词搜字幕的数据
    exportJSON(data, title) {
      // 将json转换成字符串
      let v = this;
      const blob = new Blob([JSON.stringify(data)], {type: ""})
      FileSaver.saveAs(blob, `${title}.json`)
      setTimeout(() => {
        v.subtitleData = [];
      }, 2000);
      /* setTimeout(() => {
         window.location.reload()
       }, 100000);*/
    },


    // 将处理好的数据上传到leancloud
    uploadSubtitleData(subtitleData) {
      let v = this;
      return new Promise((resolve, reject) => {
        if (subtitleData) {
          const SubtitleData = v.$leancloud.Object.extend('subtitleData');
          let keyList = ['title', 'coverUrl', 'moviesInfo', 'id'];
          const subtitle = new SubtitleData();
          keyList.map((key) => {
            subtitle.set(key, subtitleData[key]);
          });
          // 上传成功的处理
          subtitle.save().then(() => {
            v.$Message.success('上传数据成功！');
            resolve(true);
          }).catch(error => {
            reject(error);
            v.$Message.error('上传数据失败！');
            console.error('上传失败===========', error);
          });
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.analysis_list_box {
  display: flex;
  justify-content: center;
  flex-direction: column;

  .upload_box {
    width: 60%;
    margin: 20px auto 0px;
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
    margin: 10px auto 0;
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