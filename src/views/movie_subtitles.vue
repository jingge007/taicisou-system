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
        <Button type="error" class="options_btn" :disabled="selectedRows.length === 0" @click="handleBatchDelete">批量删除</Button>
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
      pageSize: 20,
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

    // 删除数据
    handleDelete(row) {
      this.$Modal.confirm({
        title: '确认删除',
        content: '确定要删除这条电影信息吗？',
        onOk: async () => {
          try {
            const item = this.$leancloud.Object.createWithoutData('movieData', row.objectId);
            // 设置公共读写权限
            const acl = new this.$leancloud.ACL();
            acl.setPublicReadAccess(true);
            acl.setPublicWriteAccess(true);
            item.setACL(acl);
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
            // 为每个对象设置公共读写权限
            objects.forEach(obj => {
              const acl = new this.$leancloud.ACL();
              acl.setPublicReadAccess(true);
              acl.setPublicWriteAccess(true);
              obj.setACL(acl);
            });
            await this.$leancloud.Object.destroyAll(objects);
            this.$Message.success('批量删除成功');
            this.getList();
          } catch (error) {
            console.error('批量删除失败:', error);
            this.$Message.error('批量删除失败: ' + error.message);
          }
        }
      });
    }
  }
}
</script>