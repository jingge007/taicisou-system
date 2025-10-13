<template>
  <div class="container_box">
    <div class="movie-subtitle-data-processing">
      <div class="upload-section">
        <Upload 
          class="upload-box" 
          multiple 
          action="*" 
          type="drag" 
          :before-upload="handleBeforeUpload"
          accept=".srt">
          <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"/>
          <p class="upload-text">单击或拖动字幕文件上传</p>
          <p class="upload-hint">*注：当前仅支持上传后缀为srt的字幕文件</p>
        </Upload>
      </div>

      <div class="processing-section" v-if="processedMovies.length > 0">
        <Card>
          <div slot="title">
            <span>已处理的电影数据</span>
            <Button 
              type="primary" 
              size="small" 
              @click="uploadAllData" 
              :loading="uploading"
              style="float: right;">
              上传所有数据到LeanCloud
            </Button>
          </div>
          <div v-viewer="viewerOptions">
            <Table 
              :data="processedMovies" 
              :columns="movieColumns" 
              border
              size="small"
              :max-height="550">
            </Table>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import srtParser2 from "srt-parser-2";
import { GetMaoyan } from '@/api/api';
import { handleLoading, ImgSize } from '@/utils/common';
import { getLeancloudApp } from '@/utils/leancloud';

export default {
  name: 'movieSubtitleDataProcessing',
  data() {
    return {
      filesData: [],
      processedMovies: [],
      uploading: false,
      viewerOptions: {
        navbar: false,
        toolbar: {
          zoomIn: true,
          zoomOut: true,
          oneToOne: true,
          reset: true,
          prev: false,
          play: false,
          next: false,
          rotateLeft: true,
          rotateRight: true,
          flipHorizontal: true,
          flipVertical: true
        }
      },
      movieColumns: [
        {
          title: '电影名称',
          key: 'title',
          minWidth: 150
        },
        {
          title: '电影ID',
          key: 'id',
          minWidth: 100
        },
        {
          title: '海报',
          key: 'coverUrl',
          minWidth: 120,
          render: (h, params) => {
            const coverUrl = params.row.coverUrl;
            if (coverUrl) {
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
                    src: coverUrl,
                    'data-source': coverUrl
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
          title: '字幕条目数',
          key: 'subtitleCount',
          minWidth: 100
        },
        {
          title: '状态',
          key: 'status',
          minWidth: 150,
          render: (h, params) => {
            const status = params.row.status;
            return h('div', [
              h('Tag', {
                props: {
                  color: status === 'success' ? 'green' : status === 'error' ? 'red' : 'blue'
                }
              }, status === 'success' ? '已处理' : status === 'error' ? '处理失败' : '处理中')
            ]);
          }
        }
      ]
    }
  },
  computed: {},
  created() {

  },
  methods: {
    // 处理文件上传
    handleBeforeUpload(file) {
      const isSRT = file.name.toLowerCase().endsWith('.srt');
      if (!isSRT) {
        this.$Message.error('只能上传.srt格式的文件');
        return false;
      }

      this.filesData.push(file);
      
      // 延迟处理文件，给用户确认的机会
      setTimeout(() => {
        this.$Modal.confirm({
          title: '上传文件成功',
          content: `已经成功上传${this.filesData.length}个文件，是否处理电影字幕数据？`,
          onOk: () => {
            this.processMovieSubtitleData(this.filesData);
            setTimeout(() => {
              this.filesData = [];
            }, 2000);
          },
          onCancel: () => {
            this.filesData = [];
          },
        });
      }, 1000);
      
      return false;
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
          !item.text.includes('') &&  // 过滤掉乱码字符
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

    // 处理电影字幕数据
    async processMovieSubtitleData(files) {
      if (!files || files.length === 0) {
        this.$Message.warning('没有文件需要处理');
        return;
      }

      handleLoading(true, '正在处理电影字幕数据...');
      this.processedMovies = [];

      try {
        // 处理每个文件
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const title = file.name.split('.srt')[0];
          
          // 添加初始状态
          const movieEntry = {
            title: title,
            id: '',
            coverUrl: '',
            moviesInfo: null,
            subtitleData: [],
            subtitleCount: 0,
            status: 'processing',
            file: file,
            srtContent: null
          };
          
          this.processedMovies.push(movieEntry);
          
          try {
            // 调用猫眼接口获取电影信息，设置超时时间
            const query = {
              kw: title,
              cityId: 30,
              stype: -1,
              WuKongReady: 'h5'
            };
            
            // 使用新的axios实例调用猫眼API
            const res = await new Promise((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                reject(new Error('请求超时，请检查网络连接或稍后重试'));
              }, 60000);
              
              GetMaoyan(query)
                .then(response => {
                  clearTimeout(timeoutId);
                  resolve(response);
                })
                .catch(error => {
                  clearTimeout(timeoutId);
                  reject(error);
                });
            });
            
            if (res.movies && res.movies.list && res.movies.list.length > 0) {
              const movies_info = res.movies.list[0];
              const img_url = movies_info.img.replace(/thumbnail\/\d+x\d+/, `thumbnail/${ImgSize}`);
              
              // 更新电影信息
              movieEntry.id = movies_info.id;
              movieEntry.coverUrl = img_url;
              movieEntry.moviesInfo = movies_info;
              
              // 读取并处理字幕文件内容
              const srtUrl = URL.createObjectURL(file);
              const response = await axios.get(srtUrl, {isbaseUrl: true});
              
              if (response) {
                const data = response || [];
                let allSubtitles = [];
                
                data.map((item) => {
                  const obj = this.handleSrtSubtitlesData(item);
                  allSubtitles.push(...obj);
                });
                
                movieEntry.subtitleData = allSubtitles;
                movieEntry.subtitleCount = allSubtitles.length;
                movieEntry.srtContent = data.join('\n\n'); // 保存原始内容
                movieEntry.status = 'success';
              }
            } else {
              movieEntry.status = 'error';
              console.log(`获取电影信息失败：=========${file.name}========`, res);
              this.$Message.warning(`未能找到电影"${title}"的信息`);
            }
          } catch (error) {
            movieEntry.status = 'error';
            console.log(`处理电影字幕数据失败：=========${file.name}========`, error);
            this.$Message.error(`处理"${file.name}"时发生错误: ${error.message}`);
          }
        }
        
        handleLoading(false);
        this.$Message.success('电影字幕数据处理完成');
      } catch (error) {
        handleLoading(false);
        this.$Message.error('处理电影字幕数据时发生错误: ' + error.message);
        console.error('处理电影字幕数据错误:', error);
      }
    },

    // 检查电影数据是否已存在于数据库中
    async checkMovieExists(app, className, movieId, title) {
      try {
        const query = new app.Query(className);
        query.equalTo('id', movieId);
        query.equalTo('title', title);
        const count = await query.count();
        return count > 0;
      } catch (error) {
        console.error('检查电影数据是否存在时出错:', error);
        return false; // 出错时假设不存在，避免阻止上传
      }
    },

    // 上传所有数据到LeanCloud
    async uploadAllData() {
      if (this.processedMovies.length === 0) {
        this.$Message.warning('没有数据需要上传');
        return;
      }

      // 1. 只能上传状态是已处理的数据，不能上传处理失败的数据
      const successMovies = this.processedMovies.filter(movie => movie.status === 'success');
      if (successMovies.length === 0) {
        this.$Message.warning('没有成功处理的电影数据需要上传');
        return;
      }

      this.uploading = true;
      handleLoading(true, '正在上传数据到LeanCloud...');

      try {
        // 获取两个LeanCloud应用实例
        const movieSubtitleDataApp = getLeancloudApp('movieSubtitleData');
        const subtitleApp = this.$leancloud; // 默认应用 (subtitle应用)
        
        let successCount = 0;
        let errorCount = 0;
        let duplicateCount = 0;
        
        // 2. 检查重复数据
        // 创建一个映射来跟踪已经处理的电影ID和标题
        const processedMovieMap = new Map();
        
        // 上传到movieSubtitleData应用的subtitleData表
        for (let i = 0; i < successMovies.length; i++) {
          const movie = successMovies[i];
          
          // 检查是否已经在本次上传中处理过相同ID和标题的电影
          const movieKey = `${movie.id}-${movie.title}`;
          if (processedMovieMap.has(movieKey)) {
            duplicateCount++;
            console.warn(`跳过重复电影数据: ID=${movie.id}, Title=${movie.title}`);
            continue;
          }
          
          try {
            // 检查movieSubtitleData应用中是否已存在相同数据
            const isMovieExistsInSubtitleData = await this.checkMovieExists(
              movieSubtitleDataApp, 
              'subtitleData', 
              movie.id, 
              movie.title
            );
            
            if (isMovieExistsInSubtitleData) {
              duplicateCount++;
              console.warn(`movieSubtitleData应用中已存在电影数据: ID=${movie.id}, Title=${movie.title}`);
              continue;
            }
            
            // 检查subtitle应用中是否已存在相同数据
            const isMovieExistsInMovieData = await this.checkMovieExists(
              subtitleApp, 
              'movieData', 
              movie.id, 
              movie.title
            );
            
            if (isMovieExistsInMovieData) {
              duplicateCount++;
              console.warn(`subtitle应用中已存在电影数据: ID=${movie.id}, Title=${movie.title}`);
              continue;
            }
            
            // 标记为已处理
            processedMovieMap.set(movieKey, true);
            
            // 1. 上传处理后的字幕数据到movieSubtitleData应用的subtitleData表
            // 包含title、coverUrl、moviesInfo、id，movieSubtitleFiles字段
            const SubtitleData = movieSubtitleDataApp.Object.extend('subtitleData');
            const subtitleData = new SubtitleData();
            
            // 设置字幕数据（电影相关信息）
            subtitleData.set('title', movie.title);
            subtitleData.set('id', movie.id);
            subtitleData.set('coverUrl', movie.coverUrl);
            subtitleData.set('moviesInfo', movie.moviesInfo);
            
            // 将处理后的字幕文件内容保存到movieSubtitleFiles字段
            if (movie.srtContent) {
              // 创建一个Blob对象用于文件上传
              const blob = new Blob([movie.srtContent], { type: 'text/plain' });
              const file = new movieSubtitleDataApp.File(`${movie.title}.srt`, blob);
              const savedFile = await file.save();
              subtitleData.set('movieSubtitleFiles', savedFile);
            }
            
            // 保存到movieSubtitleData应用
            await subtitleData.save();
            
            // 2. 上传电影信息到默认应用(subtitle应用)的movieData表
            // 只包含电影基本信息
            const MovieData = subtitleApp.Object.extend('movieData');
            const movieData = new MovieData();
            
            // 设置电影数据
            movieData.set('title', movie.title);
            movieData.set('id', movie.id);
            movieData.set('coverUrl', movie.coverUrl);
            movieData.set('moviesInfo', movie.moviesInfo);
            
            // 保存到默认应用(subtitle应用)
            await movieData.save();
            
            successCount++;
          } catch (uploadError) {
            errorCount++;
            console.error(`上传电影"${movie.title}"数据失败:`, uploadError);
            this.$Message.error(`上传电影"${movie.title}"数据失败: ${uploadError.message}`);
            // 继续处理下一个电影，不中断整个流程
          }
        }

        this.uploading = false;
        handleLoading(false);
        
        // 使用 $Modal 显示上传结果
        this.$Modal.success({
          title: '数据上传完成',
          content: `
            <p>成功上传: ${successCount} 个电影数据</p>
            <p>上传失败: ${errorCount} 个</p>
            <p>重复数据: ${duplicateCount} 个（已跳过）</p>
          `,
          okText: '确定'
        });
      } catch (error) {
        this.uploading = false;
        handleLoading(false);
        this.$Message.error('上传数据失败: ' + error.message);
        console.error('上传数据失败:', error);
      }
    }
  },
  watch: {},
  components: {}
};
</script>

<style lang="less" scoped>
.movie-subtitle-data-processing {
  padding: 20px;
  
  .upload-section {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
    
    .upload-box {
      width: 60%;
      
      /deep/ .ivu-upload-drag {
        padding: 30px 0;
        border: 2px dashed #c1c1c1;
        
        &:hover {
          border: 2px dashed #2d8cf0;
        }
      }
      
      .upload-text {
        color: #666;
        font-size: 22px;
        margin: 8px 0;
      }
      
      .upload-hint {
        color: #999;
        font-size: 14px;
      }
    }
  }
  
  .processing-section {
    margin-top: 20px;
  }
  
  /deep/ .ivu-table {
    th, td {
      text-align: center;
    }
  }
}
</style>