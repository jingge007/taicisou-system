<template>
  <div class="analysis-list-container">
    <Card class="upload-card">
      <div class="main-content">
        <div class="upload-section">
          <Upload
            class="upload-box"
            multiple
            action="*"
            type="drag"
            :before-upload="handleBeforeUpload"
          >
            <div class="upload-content">
              <Icon type="ios-cloud-upload" size="40" class="upload-icon"/>
              <p class="upload-text">单击或拖动字幕文件上传</p>
              <span class="upload-note">*注：当前仅支持上传 .srt 格式文件</span>
            </div>
          </Upload>
        </div>

        <div class="options-section">
          <div class="switch-item">
            <Icon type="ios-cloud-upload-outline" size="20" class="switch-icon"/>
            <span class="switch-label">上传到 LeanCloud：</span>
            <i-switch v-model="isUploadToLeanCloud" size="large">
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </div>

          <div class="switch-item">
            <Icon type="md-download" size="20" class="switch-icon"/>
            <span class="switch-label">导出 JSON 文件：</span>
            <i-switch v-model="isExportJSON" size="large">
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </div>

          <div class="switch-item">
            <Icon type="md-cloud-upload" size="20" class="switch-icon"/>
            <span class="switch-label">默认上传数据：</span>
            <i-switch v-model="isDefaultUpload" size="large">
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </div>
        </div>
      </div>
    </Card>

    <Card class="progress-card" v-if="uploadProgressList.length > 0">
      <div class="card-header flex">
        <Icon type="md-list" size="24" class="header-icon"/>
        <h2 class="card-title">上传进度</h2>
        <div class="toolbar">
          <Button 
            type="primary" 
            :disabled="selectedRows.length === 0" 
            @click="handleBatchUpload"
            style="margin-left: 10px;">
            批量上传选中数据
          </Button>
        </div>
      </div>
      <div v-viewer="viewerOptions">
        <Table
          border
          :columns="tableColumns"
          :data="uploadProgressList"
          size="small"
          class="progress-table"
          :max-height="500"
          @on-selection-change="handleSelectionChange"
        />
      </div>
    </Card>
  </div>
</template>

<script>
import axios from "axios";
import FileSaver from "file-saver";
import srtParser2 from "srt-parser-2";
import {handleLoading, ImgSize} from "@/utils/common";
import {GetMaoyan} from "@/api/api";

export default {
  data() {
    return {
      filesData: [],                     // 存储上传的文件数据
      movieDataList: [],                 // 存储处理后的电影数据列表
      uploadProgressList: [],            // 存储上传进度信息列表
      isUploadToLeanCloud: true,         // 是否上传到LeanCloud的开关
      isExportJSON: true,                // 是否导出JSON文件的开关
      isDefaultUpload: true,             // 是否默认上传数据的开关
      isProcessing: false,                // 处理状态标志，用于跟踪是否正在处理数据
      selectedRows: [],                  // 选中的行数据
      viewerOptions: {
        navbar: false,
        title: false,
        zIndex: 9999999,
        toolbar: {
          zoomIn: true,
          zoomOut: true,
          oneToOne: true,
          reset: false,
          prev: false,
          play: false,
          next: false,
          rotateLeft: true,
          rotateRight: true,
          flipHorizontal: true,
          flipVertical: true
        }
      },
      tableColumns: [                    // 上传进度表格的列配置
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        },
        {
          title: "电影ID",
          key: "id",
          width: 100,
          align: 'center',
          minWidth: 100
        },
        {
          title: "电影名",
          key: "title",
          minWidth: 150,
          ellipsis: true
        },
        {
          title: "状态",
          key: "status",
          width: 100,
          align: 'center',
          minWidth: 100,
          render: (h, params) => h("Tag", {props: {color: params.row.status === "成功" ? "success" : "error"}}, params.row.status)
        },
        {
          title: "封面",
          key: "coverUrl",
          minWidth: 150,
          render: (h, params) => {
            if (params.row.coverUrl) {
              return h('div', {
                style: {
                  padding: '5px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }
              }, [
                h('img', {
                  attrs: {
                    src: params.row.coverUrl,
                    'data-source': params.row.coverUrl
                  },
                  style: {
                    width: '80px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: '1px solid #e8eaec'
                  }
                })
              ]);
            }
            return h('span', '无图片');
          }
        },
        {
          title: "电影评分",
          key: "sc",
          minWidth: 120,
          align: 'center'
        },
        {
          title: "电影类型",
          key: "cat",
          minWidth: 120,
          align: 'center'
        },
        {
          title: "上映日期",
          key: "rt",
          minWidth: 120,
          align: 'center'
        },
        {
          title: "演员信息",
          key: "star",
          minWidth: 150,
          align: 'center'
        },
        {
          title: "导演",
          key: "dir",
          minWidth: 150,
          align: 'center'
        },
        {
          title: "地区",
          key: "src",
          minWidth: 120,
          align: 'center'
        },
        {
          title: "版本",
          key: "ver",
          minWidth: 140,
          align: 'center'
        },
        {
          title: "操作",
          key: "action",
          minWidth: 250,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            // 状态为失败时不展示下载、查看按钮
            if (params.row.status !== "成功") {
              return h("div", [
                h("Button", {
                  props: {type: "error", size: "small"},
                  on: {
                    click: () => {
                      // 删除记录
                      this.$Modal.confirm({
                        title: "确认删除",
                        content: "确定要删除这条记录吗？",
                        onOk: () => {
                          const index = this.uploadProgressList.findIndex(item => item.id === params.row.id);
                          if (index !== -1) {
                            this.uploadProgressList.splice(index, 1);
                            const movieIndex = this.movieDataList.findIndex(item => item.id === params.row.id);
                            if (movieIndex !== -1) {
                              this.movieDataList.splice(movieIndex, 1);
                            }
                            this.$Message.success("删除成功");
                          }
                        }
                      });
                    }
                  }
                }, "删除")
              ]);
            }

            return h("div", [
              h("Button", {
                props: {type: "primary", size: "small"},
                style: {marginRight: "10px"},
                on: {
                  click: () => {
                    // 下载字幕文件
                    const movieData = this.movieDataList.find(item => item.id === params.row.id);
                    if (movieData) {
                      const blob = new Blob([movieData.movieSubtitleFiles], {type: "text/plain;charset=utf-8"});
                      FileSaver.saveAs(blob, `${movieData.title}.srt`);
                    }
                  }
                }
              }, "下载"),
              h("Button", {
                props: {type: "info", size: "small"},
                style: {marginRight: "10px"},
                on: {
                  click: () => {
                    // 查看字幕内容
                    const movieData = this.movieDataList.find(item => item.id === params.row.id);
                    if (movieData) {
                      // 计算字幕条数
                      const subtitleCount = movieData.subtitleData ? movieData.subtitleData.length : 0;
                      
                      this.$Modal.info({
                        title: "字幕内容预览",
                        content: `
                          <div>
                            <p><strong>字幕条数统计：</strong>${subtitleCount} 条</p>
                            <pre style="white-space: pre-wrap; word-wrap: break-word; max-height: 400px; overflow-y: auto;">${movieData.movieSubtitleFiles}</pre>
                          </div>
                        `,
                        width: 800
                      });
                    }
                  }
                }
              }, "查看"),
              h("Button", {
                props: {type: "error", size: "small"},
                on: {
                  click: () => {
                    // 删除记录
                    this.$Modal.confirm({
                      title: "确认删除",
                      content: "确定要删除这条记录吗？",
                      onOk: () => {
                        const index = this.uploadProgressList.findIndex(item => item.id === params.row.id);
                        if (index !== -1) {
                          this.uploadProgressList.splice(index, 1);
                          const movieIndex = this.movieDataList.findIndex(item => item.id === params.row.id);
                          if (movieIndex !== -1) {
                            this.movieDataList.splice(movieIndex, 1);
                          }
                          this.$Message.success("删除成功");
                        }
                      }
                    });
                  }
                }
              }, "删除")
            ]);
          }
        }
      ]
    };
  },
  methods: {
    /**
     * 处理文件上传前的验证
     * @param {File} file - 上传的文件对象
     * @returns {boolean} - 是否继续上传流程
     */
    handleBeforeUpload(file) {
      if (!file.name.toLowerCase().endsWith(".srt")) {
        this.$Message.error("只能上传 .srt 格式文件");
        return false;
      }
      this.filesData.push(file);

      setTimeout(() => {
        this.$Modal.confirm({
          title: "上传文件成功",
          content: `已成功上传 ${this.filesData.length} 个文件，是否处理字幕数据？`,
          onOk: () => {
            this.handleSubtitleDataSequentially(this.filesData);
            setTimeout(() => this.filesData = [], 2000);
          },
          onCancel: () => this.filesData = []
        });
      }, 800);
      return false;
    },

    /**
     * 顺序处理字幕数据
     * @param {Array} fileList - 文件列表
     */
    async handleSubtitleDataSequentially(fileList) {
      // 如果文件列表为空，直接返回
      if (!fileList.length) return;

      // 初始化数据列表和进度列表
      this.uploadProgressList = [];
      this.movieDataList = [];
      this.isProcessing = true; // 设置处理状态为true
      handleLoading(true, "正在按顺序请求电影信息...");

      // 依次处理每个文件
      for (let file of fileList) {
        // 从文件名提取电影标题（去除.srt扩展名）
        const title = file.name.replace(".srt", "");
        // 构造查询参数
        const query = {kw: title, cityId: 30, stype: -1, WuKongReady: "h5"};

        try {
          // 请求获取电影信息
          const res = await GetMaoyan(query);
          if (res?.movies?.list?.length) {
            // 获取第一个匹配的电影信息
            const movieInfo = res.movies.list[0];
            // 处理电影封面图片URL
            const imgUrl = movieInfo.img.replace(/thumbnail\/\d+x\d+/, `thumbnail/${ImgSize}`);

            // 读取文件内容
            const fileContent = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsText(file, 'utf-8');
            });

            // 解析SRT字幕文件
            const parser = new srtParser2();
            const subtitlesRaw = parser.fromSrt(fileContent || "");
            // 过滤掉包含特殊符号的字幕项
            const subtitles = subtitlesRaw.filter(item => {
              const text = item.text || "";
              return !text.includes("{\\") && !text.includes("♪") && !text.includes("{\\fs") && !text.includes("{\\an") && !text.includes("{\\fad");
            }).map((item, index) => {
              // 分离中英文字幕内容
              const lines = item.text.split("\n");
              return {
                zhContent: lines[0]?.trim() || "",         // 中文字幕内容
                esContent: lines[1]?.trim() || "",         // 英文字幕内容
                content: item.text.trim(),                 // 原始字幕内容
                startTime: item.startTime,                 // 字幕开始时间
                endTime: item.endTime,                     // 字幕结束时间
                subtitleId: `${movieInfo.id}-${index}`,    // 字幕ID
                movieId: movieInfo.id,                     // 电影ID
                title: movieInfo.nm,                       // 电影名称
                coverUrl: imgUrl,                          // 电影封面URL
                moviesInfo: movieInfo,                     // 电影信息
                index
              };
            });

            // 构造处理后的SRT内容
            const processedSrtContent = subtitles.map((item, index) => `
${index + 1}
${item.startTime} --> ${item.endTime}
${item.zhContent}${item.esContent ? '\n' + item.esContent : ''}`).join("\n\n");

            // 构造电影数据对象
            const movieData = {
              title: movieInfo.nm,
              coverUrl: imgUrl,
              moviesInfo: movieInfo,
              id: movieInfo.id,
              movieSubtitleFiles: processedSrtContent,
              // 保存原始文件名用于LeanCloud上传
              originalFileName: file.name,
              subtitleData: subtitles
            };

            // 将处理后的数据添加到列表中
            this.movieDataList.push(movieData);
            
            // 构造上传进度列表项，包含moviesInfo中的字段信息
            this.uploadProgressList.push({
              fileName: file.name, 
              title: movieInfo.nm, 
              id: movieInfo.id, 
              coverUrl: imgUrl, 
              status: "成功",
              sc: movieInfo.sc,           // 电影评分
              cat: movieInfo.cat,         // 电影类型
              rt: movieInfo.rt,           // 上映日期
              star: movieInfo.star,       // 演员信息
              dir: movieInfo.dir,         // 导演
              src: movieInfo.src,         // 地区
              ver: movieInfo.ver          // 版本
            });
          } else {
            // 如果未找到电影信息，添加失败记录
            this.uploadProgressList.push({fileName: file.name, title, id: "", coverUrl: "", status: "失败"});
          }
        } catch (err) {
          // 处理异常情况
          console.error(file.name, err);
          this.uploadProgressList.push({fileName: file.name, title, id: "", coverUrl: "", status: "失败"});
        }

        // 添加延迟以避免请求过于频繁
        await new Promise(r => setTimeout(r, 800));
      }

      // 处理完成后，根据默认上传开关决定是否显示提示框
      if (this.isDefaultUpload) {
        // 开关开启时，自动执行后续操作，不显示提示框
        await this.handleAutoProcess();
      } else {
        // 开关关闭时，显示处理完成弹窗
        this.$Modal.confirm({
          title: "字幕文件处理完毕",
          content: `共处理 ${fileList.length} 个文件，是否执行后续操作？`,
          onOk: async () => {
            const successList = this.movieDataList;
            // 检查是否开启了任何操作
            if (!this.isUploadToLeanCloud && !this.isExportJSON) {
              this.$Message.warning("未开启上传或导出操作，请检查开关设置");
              this.isProcessing = false;
              handleLoading(false);
              return;
            }

            // 执行上传操作（如果开启）
            let hasError = false;
            if (this.isUploadToLeanCloud && successList.length > 0) {
              try {
                await this.uploadMovieData(successList);
              } catch (err) {
                hasError = true;
                console.error(err);
              }
            }

            // 执行导出操作（如果开启）
            if (this.isExportJSON) this.exportJSON(successList, "subtitleData");

            // 完成所有操作后更新状态和隐藏loading
            this.isProcessing = false;
            handleLoading(false);

            // 显示操作结果消息
            if (!hasError) {
              this.$Message.success("所有操作已完成！");
            } else {
              this.$Message.error("部分操作执行失败，请查看控制台");
            }
          },
          onCancel: () => {
            // 取消操作时更新状态和隐藏loading
            this.isProcessing = false;
            handleLoading(false);
          }
        });
      }
    },

    /**
     * 自动处理数据（当默认上传开关开启时）
     */
    async handleAutoProcess() {
      const successList = this.movieDataList;
      // 检查是否开启了任何操作
      if (!this.isUploadToLeanCloud && !this.isExportJSON) {
        this.$Message.warning("未开启上传或导出操作，请检查开关设置");
        this.isProcessing = false;
        handleLoading(false);
        return;
      }

      // 执行上传操作（如果开启）
      let hasError = false;
      if (this.isUploadToLeanCloud && successList.length > 0) {
        try {
          await this.uploadMovieData(successList);
        } catch (err) {
          hasError = true;
          console.error(err);
        }
      }

      // 执行导出操作（如果开启）
      if (this.isExportJSON) this.exportJSON(successList, "subtitleData");

      // 完成所有操作后更新状态和隐藏loading
      this.isProcessing = false;
      handleLoading(false);

      // 显示操作结果消息
      if (!hasError) {
        this.$Message.success("所有操作已完成！");
      } else {
        this.$Message.error("部分操作执行失败，请查看控制台");
      }
    },

    /**
     * 处理选择变化
     * @param {Array} selection - 选中的行数据
     */
    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    /**
     * 批量上传选中的数据
     */
    async handleBatchUpload() {
      if (this.selectedRows.length === 0) {
        this.$Message.warning("请先选择要上传的数据");
        return;
      }

      // 过滤出状态为成功的数据
      const selectedSuccessRows = this.selectedRows.filter(row => row.status === "成功");
      if (selectedSuccessRows.length === 0) {
        this.$Message.warning("选中的数据中没有状态为成功的记录");
        return;
      }

      // 根据选中的行ID找到对应的movieData
      const selectedMovieData = this.movieDataList.filter(movie => 
        selectedSuccessRows.some(row => row.id === movie.id)
      );

      if (selectedMovieData.length === 0) {
        this.$Message.warning("未找到选中记录对应的详细数据");
        return;
      }

      try {
        handleLoading(true, "正在批量上传数据...");
        await this.uploadMovieData(selectedMovieData);
        this.$Message.success(`成功上传 ${selectedMovieData.length} 条数据`);
      } catch (err) {
        console.error(err);
        this.$Message.error("批量上传失败，请查看控制台");
      } finally {
        handleLoading(false);
      }
    },

    /**
     * 上传电影数据到LeanCloud
     * @param {Array} list - 电影数据列表
     */
    async uploadMovieData(list) {
      try {
        handleLoading(true, "正在上传到 LeanCloud...");
        // 遍历电影数据列表并逐个上传
        for (let item of list) {
          // 创建LeanCloud对象
          const MovieData = this.$leancloud.Object.extend("movieData");
          const movie = new MovieData();

          // 设置电影基本信息
          movie.set("title", item.title);
          movie.set("coverUrl", item.coverUrl);
          movie.set("moviesInfo", item.moviesInfo);
          movie.set("id", item.id);

          // 创建并上传处理后的字幕文件
          const processedBlob = new Blob([item.movieSubtitleFiles], {type: 'text/plain'});
          // 使用保存的原始文件名
          const processedFile = new this.$leancloud.File(item.originalFileName, processedBlob);
          const uploadedProcessed = await processedFile.save();

          // 设置文件URL
          movie.set("movieSubtitleFiles", uploadedProcessed.url());

          // 保存电影数据
          await movie.save();
        }
        // 不再在这里关闭loading和显示消息
      } catch (err) {
        // 不再在这里关闭loading
        throw err; // 抛出错误供上层处理
      }
    },

    /**
     * 导出JSON数据
     * @param {Array} list - 电影数据列表
     * @param {String} filename - 导出文件名
     */
    exportJSON(list, filename) {
      const exportData = [];
      // 遍历电影数据列表，构造导出数据格式
      list.forEach(item => {
        item.subtitleData.forEach(sub => {
          exportData.push({
            coverUrl: item.coverUrl,
            moviesInfo: {
              title: item.title,
              coverUrl: item.coverUrl,
              moviesInfo: item.moviesInfo,
              id: item.id
            },
            startTime: sub.startTime,
            movieId: sub.movieId,
            content: sub.content,
            endTime: sub.endTime,
            title: sub.title,
            subtitleId: sub.subtitleId,
            esContent: sub.esContent,
            zhContent: sub.zhContent
          });
        });
      });
      // 创建并保存JSON文件
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: "application/json"});
      FileSaver.saveAs(blob, `${filename}.json`);
      // 不再在这里显示消息
    }
  },
  /**
   * 组件销毁前的处理
   */
  beforeDestroy() {
    // 确保在组件销毁前关闭loading
    if (this.isProcessing) {
      handleLoading(false);
    }
  }
};
</script>

<style lang="less" scoped>
.analysis-list-container {
  /* 保持原有样式 */
}

.main-content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.upload-section {
  flex: 1;
  min-width: 300px;
  margin-bottom: 0;
}

.options-section {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.upload-box /deep/ .ivu-upload-drag {
  padding: 10px 20px;
  border: 2px dashed #c1c1c1;
  background: #fafafa;
  transition: 0.3s;
  height: 100%;
  height: 160px;
  display: flex;
  align-items: center;
}

.upload-box /deep/ .ivu-upload-drag:hover {
  border-color: #2d8cf0;
  background: #f0faff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.upload-icon {
  color: #2d8cf0;
  margin-bottom: 15px;
}

.upload-text {
  color: #666;
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 10px;
}

.upload-note {
  color: #ed4014;
  font-weight: bold;
  font-size: 13px;
}

.options-section .switch-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 6px;
  transition: 0.3s;
}

.options-section .switch-item:hover {
  background: #edf5ff;
}

.switch-icon {
  color: #2d8cf0;
  margin-right: 10px;
}

.switch-label {
  flex: 1;
  font-size: 16px;
  color: #515a6e;
  font-weight: 500;
}

.progress-table /deep/ .ivu-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.progress-table /deep/ .ivu-table td {
  border-bottom: 1px solid #eee;
}

.progress-table /deep/ .ivu-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-table /deep/ .ivu-table:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.upload-card, .progress-card {
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: none;
}

.progress-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  margin: 0;
  margin-left: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-icon {
  color: #2d8cf0;
}

.toolbar {
  margin-left: auto;
}

@media (max-width: 768px) {
  .analysis-list-container {
    padding: 15px;
  }

  .main-content {
    flex-direction: column;
  }

  .options-section {
    width: 100%;
  }

  .options-section .switch-item {
    padding: 12px 15px;
  }
  
  .card-header {
    flex-wrap: wrap;
  }
  
  .toolbar {
    margin-left: 0;
    margin-top: 10px;
    width: 100%;
  }
}
</style>