<template>
  <div class="movie-subtitles-container">
    <Card style="margin-bottom: 20px;">
      <Form :model="searchForm" :label-width="120" inline>
        <Row :gutter="16">
          <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
            <FormItem label="电影名称：">
              <Input v-model="searchForm.movieName" placeholder="请输入电影名称" style="width: 100%;"/>
            </FormItem>
          </Col>
          <Col style="width: 200px;" push="1">
            <Button @click="handleReset" icon="md-refresh" class="mr10">重置</Button>
            <Button type="primary" @click="handleSearch" icon="md-search">查询</Button>
          </Col>
        </Row>
      </Form>
    </Card>

    <Card>
      <div style="margin-bottom: 15px;">
        <Button type="primary" class="options_btn" @click="showAddModal">新增</Button>
        <Button type="error" class="options_btn" :disabled="selectedRows.length === 0" @click="handleBatchDelete"
          style="margin-left: 10px;">批量删除</Button>
        <Button type="info" class="options_btn" @click="countUniqueMovies" style="margin-left: 10px;">统计电影总数</Button>
      </div>

      <div v-viewer="viewerOptions">
        <Table
          border
          :columns="tableColumns"
          :data="tableData"
          size="small"
          class="progress-table"
          :max-height="580"
          @on-selection-change="handleSelectionChange">
        </Table>
      </div>
      <div style="margin: 20px 0; overflow: hidden">
        <div style="float: right;">
          <Page
            :total="total"
            :current="currentPage"
            :page-size="pageSize"
            @on-change="handlePageChange"
            @on-page-size-change="handlePageSizeChange"
            show-sizer
            show-elevator
            show-total>
          </Page>
        </div>
      </div>
    </Card>
    <!-- 新增/编辑对话框 -->
    <Modal
      v-model="modalVisible"
      :title="editMode ? '编辑电影字幕' : '新增电影字幕'"
      @on-ok="handleSave"
      @on-cancel="handleCancel"
      class-name="movie-subtitles-modal"
      width="800">
      <Form :model="formData" :label-width="120" ref="form" :rules="formRules">
        <Row :gutter="gutterItem" style="width:90%">
          <Col :xxl="oneItemCol" :xl="oneItemCol" :lg="oneItemCol" :md="oneItemCol">
            <FormItem label="电影名称" prop="title">
              <Input v-model="formData.title" placeholder="请输入电影名称"/>
            </FormItem>
          </Col>
          <Col :xxl="oneItemCol" :xl="oneItemCol" :lg="oneItemCol" :md="oneItemCol">
            <FormItem label="电影ID" prop="id">
              <Input v-model="formData.id" placeholder="请输入电影ID"/>
            </FormItem>
          </Col>
          <Col :xxl="oneItemCol" :xl="oneItemCol" :lg="oneItemCol" :md="oneItemCol">
            <FormItem label="海报图片URL" prop="coverUrl">
              <Input v-model="formData.coverUrl" placeholder="请输入海报图片URL" show-word-limit maxlength="500"/>
            </FormItem>
          </Col>
          <Col :xxl="oneItemCol" :xl="oneItemCol" :lg="oneItemCol" :md="oneItemCol">
            <FormItem label="海报预览" v-if="formData.coverUrl && isValidImageUrl(formData.coverUrl)">
              <div style="max-width: 100%; overflow: hidden; cursor: pointer;" v-viewer="viewerOptions">
                <img :src="formData.coverUrl" style="max-width: 100%; max-height: 200px; border-radius: 4px;"/>
              </div>
            </FormItem>
          </Col>
        </Row>
      </Form>
    </Modal>
    
    <!-- 使用公共的字幕预览组件 -->
    <SubtitlePreviewModal 
      v-model="subtitleModalVisible" 
      :subtitle-data="currentSubtitleData"
      @close="subtitleModalVisible = false">
    </SubtitlePreviewModal>
  </div>
</template>

<style lang="less" scoped>
.options_btn {
  margin-right: 10px;
}

/deep/ .ivu-form-item-label {
  font-weight: bold;
}

</style>

<style lang="less">
.movie-subtitles-modal {
  .ivu-modal-header {
    background-color: #f0f2f5;
    border-bottom: 1px solid #e8eaec;
    border-radius: 4px 4px 0 0;

    p {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  .ivu-modal-body {
    padding: 24px;
  }

  .ivu-modal-footer {
    text-align: right;
    border-top: 1px solid #e8eaec;
    padding: 16px 24px;

    .ivu-btn {
      min-width: 80px;
      border-radius: 4px;
      margin-left: 12px;
    }

    .ivu-btn-primary {
      background-color: #2d8cf0;
      border-color: #2d8cf0;
    }
  }

  .ivu-form-item-label {
    font-weight: 600;
    color: #515a6e;
  }

  .ivu-input, .ivu-input textarea {
    border-radius: 4px;
  }
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

</style>

<script type="text/ecmascript-6">
import commonMixin from '@/utils/common_mixin.js';
import tools from '@/utils/tools';

export default {
  name: "movieSubtitles",
  mixins: [commonMixin],
  components: {
    SubtitlePreviewModal: () => import('@/components/SubtitlePreviewModal.vue')
  },
  data() {
    // 表单验证规则
    const requiredRule = (message) => [{required: true, message, trigger: 'blur'}];

    return {
      searchForm: {
        movieName: ''
      },
      formRules: {
        title: requiredRule('电影名称不能为空'),
        id: requiredRule('电影ID不能为空'),
        coverUrl: [
          ...requiredRule('海报图片URL不能为空'),
          {
            validator: (rule, value, callback) => {
              if (value && !this.isValidImageUrl(value)) {
                callback(new Error('请输入有效的图片链接'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ]
      },
      tableColumns: [
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
            return h("div", [
              h("Button", {
                props: {type: "primary", size: "small"},
                style: {marginRight: "10px"},
                on: {
                  click: () => {
                    // 下载字幕文件
                    const movieData = this.tableData.find(item => item.id === params.row.id);
                    if (movieData) {
                      const blob = new Blob([movieData.movieSubtitleFiles], {type: "text/plain;charset=utf-8"});
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `${movieData.title}.srt`;
                      link.click();
                      URL.revokeObjectURL(link.href);
                      this.$Message.success('字幕文件下载成功');
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
                    const movieData = this.tableData.find(item => item.id === params.row.id);
                    if (movieData) {
                      // 计算字幕条数
                      this.currentSubtitleData = movieData;
                      this.subtitleCount = movieData.movieSubtitleFiles ? 
                        movieData.movieSubtitleFiles.split('\n\n').filter(item => item.trim() !== '').length : 0;
                      this.subtitleModalVisible = true;
                    }
                  }
                }
              }, "查看"),
              h("Button", {
                props: {type: "error", size: "small"},
                on: {
                  click: () => {
                    // 删除记录
                    this.handleDelete(params.row);
                  }
                }
              }, "删除")
            ]);
          }
        }
      ],
      tableData: [],
      selectedRows: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      modalVisible: false,
      editMode: false,
      formData: {
        title: '',
        id: '',
        coverUrl: ''
      },
      currentRow: null,
      previewImages: [],
      sortOrder: 'desc', // 默认按创建时间降序排列
      subtitleModalVisible: false,
      currentSubtitleData: null,
      subtitleCount: 0
    }
  },
  created() {
    this.getList();
  },
  methods: {
    // 查询功能
    handleSearch() {
      this.currentPage = 1;
      this.getList();
    },

    // 重置功能
    handleReset() {
      this.searchForm = {
        movieName: ''
      };
      this.currentPage = 1;
      this.getList();
    },

    // 获取列表数据
    async getList() {
      try {
        // 修改为查询 movieData 表
        const query = new this.$leancloud.Query('movieData');

        // 添加模糊搜索条件
        if (this.searchForm.movieName) {
          query.contains('title', this.searchForm.movieName);
        }

        // 设置分页
        query.limit(this.pageSize)
          .skip((this.currentPage - 1) * this.pageSize);

        // 默认按创建时间降序排列
        query.descending('createdAt');

        // 执行查询
        const results = await query.find();

        // 获取总数（同样应用搜索条件）
        const totalQuery = new this.$leancloud.Query('movieData');
        if (this.searchForm.movieName) {
          totalQuery.contains('title', this.searchForm.movieName);
        }

        this.total = await totalQuery.count();

        // 处理返回数据
        this.tableData = results.map(item => {
          const data = item.toJSON();
          
          // 获取系统字段
          let createdAt = item.get('createdAt');
          let updatedAt = item.get('updatedAt');
          
          // 转换为日期对象
          if (createdAt && typeof createdAt.toDate === 'function') {
            createdAt = createdAt.toDate();
          }
          
          if (updatedAt && typeof updatedAt.toDate === 'function') {
            updatedAt = updatedAt.toDate();
          }
          
          // 从 moviesInfo 提取电影信息
          let movieInfo = {};
          if (data.moviesInfo) {
            movieInfo = {
              sc: data.moviesInfo.sc,     // 电影评分
              cat: data.moviesInfo.cat,   // 电影类型
              rt: data.moviesInfo.rt,     // 上映日期
              star: data.moviesInfo.star, // 演员信息
              dir: data.moviesInfo.dir,   // 导演
              src: data.moviesInfo.src,   // 地区
              ver: data.moviesInfo.ver    // 版本
            };
          }
          
          return {
            ...data,
            ...movieInfo,
            key: data.objectId,
            createdAt,
            updatedAt
          };
        });
      } catch (error) {
        console.error('获取电影字幕数据失败:', error);
        this.$Message.error('获取数据失败: ' + error.message);
      }
    },

    // 统计唯一电影数量
    async countUniqueMovies() {
      try {
        // 修改为查询 movieData 表
        const query = new this.$leancloud.Query('movieData');
        
        // 如果有搜索条件，也应用到统计查询中
        if (this.searchForm.movieName) {
          query.contains('title', this.searchForm.movieName);
        }
        
        // 使用分页方式获取所有数据
        const allResults = [];
        let skip = 0;
        const limit = 1000;
        let hasMore = true;
        
        while (hasMore) {
          const batchQuery = new this.$leancloud.Query('movieData');
          if (this.searchForm.movieName) {
            batchQuery.contains('title', this.searchForm.movieName);
          }
          batchQuery.limit(limit).skip(skip);
          
          const batchResults = await batchQuery.find();
          allResults.push(...batchResults);
          
          // 如果返回结果少于限制数量，说明已经获取完所有数据
          if (batchResults.length < limit) {
            hasMore = false;
          } else {
            skip += limit;
          }
        }
        
        // 提取电影数据并去重
        const movieMap = new Map();
        const movieData = [];
        
        for (const item of allResults) {
          const data = item.toJSON();
          
          // 获取电影ID
          let movieId = data.id;
          
          // 获取系统字段
          let createdAt = item.get('createdAt');
          let updatedAt = item.get('updatedAt');
          
          if (createdAt && typeof createdAt.toDate === 'function') {
            createdAt = createdAt.toDate();
          }
          
          if (updatedAt && typeof updatedAt.toDate === 'function') {
            updatedAt = updatedAt.toDate();
          }
          
          // 根据电影ID去重
          if (movieId && !movieMap.has(movieId)) {
            movieMap.set(movieId, true);
            
            movieData.push({
              ...data,
              createdAt,
              updatedAt
            });
          }
        }
        
        console.log('唯一电影总数:', movieMap.size);
        console.log('唯一电影详细数据:', movieData);
        
        this.$Message.success(`查询成功，共有 ${movieMap.size} 部唯一电影，详细数据已在控制台打印`);
      } catch (error) {
        console.error('统计唯一电影数量失败:', error);
        this.$Message.error('统计失败: ' + error.message);
      }
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    // 分页变化
    handlePageChange(page) {
      this.currentPage = page;
      this.getList();
    },

    // 页面大小变化
    handlePageSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.getList();
    },

    // 显示新增对话框
    showAddModal() {
      this.editMode = false;
      this.formData = {
        title: '',
        id: '',
        coverUrl: ''
      };
      this.modalVisible = true;
    },

    // 编辑数据
    handleEdit(row) {
      this.editMode = true;
      this.currentRow = row;

      this.formData = {
        title: row.title,
        id: row.id,
        coverUrl: row.coverUrl
      };
      this.modalVisible = true;
    },

    // 保存数据
    handleSave() {
      // 表单验证
      this.$refs.form.validate(valid => {
        if (valid) {
          this.saveData();
        } else {
          this.$Message.error('请填写所有必填项并确保数据格式正确');
          this.modalVisible = true;
          return false;
        }
      });
    },

    // 实际保存数据的方法
    async saveData() {
      try {
        // 检查数据库中是否已存在相同 id 和 title 的数据
        if (!this.editMode) {
          // 新增模式下检查唯一性
          const query = new this.$leancloud.Query('movieData');
          query.equalTo('id', this.formData.id);
          query.equalTo('title', this.formData.title);
          
          const count = await query.count();
          if (count > 0) {
            this.$Message.warning(`电影 "${this.formData.title}" (ID: ${this.formData.id}) 在数据库中已存在`);
            return;
          }
        }
        
        let item;
        if (this.editMode) {
          // 编辑模式
          item = this.$leancloud.Object.createWithoutData('movieData', this.currentRow.objectId);
          this.$Message.success('更新成功');
        } else {
          // 新增模式
          const MovieData = this.$leancloud.Object.extend('movieData');
          item = new MovieData();
          this.$Message.success('新增成功');
        }

        // 设置数据，排除LeanCloud保留字段
        const reservedKeys = ['objectId', 'key', 'createdAt', 'updatedAt'];
        Object.keys(this.formData).forEach(key => {
          // 忽略LeanCloud保留字段
          if (!reservedKeys.includes(key)) {
            item.set(key, this.formData[key]);
          }
        });

        await item.save();
        this.modalVisible = false;
        this.getList();
      } catch (error) {
        console.error('保存失败:', error);
        this.$Message.error('保存失败: ' + error.message);
      }
    },

    // 取消保存
    handleCancel() {
      this.modalVisible = false;
    },

    // 删除数据
    handleDelete(row) {
      this.$Modal.confirm({
        title: '确认删除',
        content: '确定要删除这条电影信息吗？',
        onOk: async () => {
          try {
            const item = this.$leancloud.Object.createWithoutData('movieData', row.objectId);
            await item.destroy();
            this.$Message.success('删除成功');
            this.getList();
          } catch (error) {
            console.error('删除失败:', error);
            this.$Message.error('删除失败: ' + error.message);
          }
        }
      });
    },

    // 批量删除
    handleBatchDelete() {
      this.$Modal.confirm({
        title: '确认删除',
        content: `确定要删除选中的${this.selectedRows.length}条电影信息吗？`,
        onOk: async () => {
          try {
            const objects = this.selectedRows.map(row =>
              this.$leancloud.Object.createWithoutData('movieData', row.objectId)
            );
            await this.$leancloud.Object.destroyAll(objects);
            this.$Message.success('批量删除成功');
            this.getList();
          } catch (error) {
            console.error('批量删除失败:', error);
            this.$Message.error('批量删除失败: ' + error.message);
          }
        }
      });
    },

    // 验证是否为有效的图片URL
    isValidImageUrl(url) {
      if (!url) return false;

      // 检查是否为有效的URL格式
      try {
        new URL(url);
      } catch (e) {
        return false;
      }

      // 检查URL是否以常见的图片扩展名结尾
      const imageExtensions = /\.(jpeg|jpg|png|gif|bmp|webp|svg)$/i;
      return imageExtensions.test(url);
    },

  }
}
</script>