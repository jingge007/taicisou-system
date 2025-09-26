<template>
  <div class="taicisou_system_box">
    <Card style="margin-bottom: 20px;">
      <Form :model="searchForm" :label-width="120" inline>
        <Row :gutter="16">
          <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
            <FormItem label="电影名称：">
              <Input v-model="searchForm.movieName" placeholder="请输入电影名称" style="width: 100%;"/>
            </FormItem>
          </Col>
          <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
            <FormItem label="中文台词：">
              <Input v-model="searchForm.description" placeholder="请输入中文台词" style="width: 100%;"/>
            </FormItem>
          </Col>
          <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
            <FormItem label="英文台词：">
              <Input v-model="searchForm.originContent" placeholder="请输入英文台词" style="width: 100%;"/>
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
      </div>

      <div v-viewer="viewerOptions">
        <Table
          border
          :columns="tableColumns"
          :data="tableData"
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
      :title="editMode ? '编辑经典台词' : '新增经典台词'"
      @on-ok="handleSave"
      @on-cancel="handleCancel"
      class-name="classic-lines-modal"
      width="800">
      <Form :model="formData" :label-width="100" ref="form" :rules="formRules">
        <Row :gutter="gutterItem" style="width:90%">
          <Col :xxl="oneItemCol" :xl="oneItemCol" :lg="oneItemCol" :md="oneItemCol">
            <FormItem label="电影名称" prop="movieName">
              <Input v-model="formData.movieName" placeholder="请输入电影名称"/>
            </FormItem>
          </Col>
          <Col :xxl="oneItemCol" :xl="oneItemCol" :lg="oneItemCol" :md="oneItemCol">
            <FormItem label="中文台词" prop="description">
              <Input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入中文台词"/>
            </FormItem>
          </Col>
          <Col :xxl="oneItemCol" :xl="oneItemCol" :lg="oneItemCol" :md="oneItemCol">
            <FormItem label="英文台词" prop="originContent">
              <Input v-model="formData.originContent" type="textarea" :rows="4" placeholder="请输入英文台词"/>
            </FormItem>
          </Col>
          <Col :xxl="oneItemCol" :xl="oneItemCol" :lg="oneItemCol" :md="oneItemCol">
            <FormItem label="海报图片URL" prop="picUrl">
              <Input v-model="formData.picUrl" placeholder="请输入海报图片URL" show-word-limit maxlength="500"/>
            </FormItem>
          </Col>
          <Col :xxl="oneItemCol" :xl="oneItemCol" :lg="oneItemCol" :md="oneItemCol">
            <FormItem label="海报预览" v-if="formData.picUrl && isValidImageUrl(formData.picUrl)">
              <div style="max-width: 100%; overflow: hidden;">
                <img :src="formData.picUrl" style="max-width: 100%; max-height: 200px; border-radius: 4px;"/>
              </div>
            </FormItem>
          </Col>
        </Row>
      </Form>
    </Modal>
  </div>
</template>

<script type="text/ecmascript-6">
import commonMixin from '@/utils/common_mixin.js';
import tools from '@/utils/tools';

export default {
  name: "todayLinesData",
  mixins: [commonMixin],
  data() {
    // 表单验证规则
    const requiredRule = (message) => [{required: true, message, trigger: 'blur'}];

    return {
      searchForm: {
        movieName: '',
        description: '',
        originContent: ''
      },
      formRules: {
        movieName: requiredRule('电影名称不能为空'),
        description: requiredRule('中文台词不能为空'),
        originContent: requiredRule('英文台词不能为空'),
        picUrl: [
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
          align: 'center'
        },
        {
          title: 'ID',
          key: 'id',
          align: 'center',
          width: 100,
        },
        {
          title: '海报封面',
          key: 'picUrl',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            if (params.row.picUrl) {
              return h('div', {
                style: {
                  padding: '5px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }
              }, [
                h('img', {
                  attrs: {src: params.row.picUrl},
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
          title: '中文台词',
          key: 'description',
          minWidth: 240,
          align: 'center'
        },
        {
          title: '英文台词',
          key: 'originContent',
          minWidth: 240,
          align: 'center'
        },
        {
          title: '电影名称',
          key: 'movieName',
          align: 'center',
          minWidth: 150,
        },
        {
          title: '创建时间',
          key: 'createdAt',
          align: 'center',
          minWidth: 180,
          render: (h, params) => {
            const date = params.row.createdAt;
            if (date) {
              return h('span', tools.formatDate(new Date(date)));
            }
            return h('span', '无');
          }
        },
        {
          title: '更新时间',
          key: 'updatedAt',
          align: 'center',
          minWidth: 180,
          render: (h, params) => {
            const date = params.row.updatedAt;
            if (date) {
              return h('span', tools.formatDate(new Date(date)));
            }
            return h('span', '无');
          }
        },
        {
          title: '操作',
          key: 'action',
          width: 160,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {type: 'primary', size: 'small'},
                style: {marginRight: '5px'},
                on: {click: () => this.handleEdit(params.row)}
              }, '编辑'),
              h('Button', {
                props: {type: 'error', size: 'small'},
                on: {click: () => this.handleDelete(params.row)}
              }, '删除')
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
        movieName: '',
        description: '',
        originContent: '',
        picUrl: ''
      },
      currentRow: null,
      previewImages: [],
      sortOrder: 'desc' // 默认按创建时间降序排列
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
        movieName: '',
        description: '',
        originContent: ''
      };
      this.currentPage = 1;
      this.getList();
    },

    // 获取列表数据
    async getList() {
      try {
        const query = new this.$leancloud.Query('classicLinesData');

        // 添加模糊搜索条件
        Object.keys(this.searchForm).forEach(key => {
          if (this.searchForm[key]) {
            query.contains(key, this.searchForm[key]);
          }
        });

        // 设置分页
        query.limit(this.pageSize)
          .skip((this.currentPage - 1) * this.pageSize);

        // 默认按创建时间降序排列
        query.descending('createdAt');

        // 执行查询
        const results = await query.find();

        // 获取总数（同样应用搜索条件）
        const totalQuery = new this.$leancloud.Query('classicLinesData');
        Object.keys(this.searchForm).forEach(key => {
          if (this.searchForm[key]) {
            totalQuery.contains(key, this.searchForm[key]);
          }
        });

        this.total = await totalQuery.count();

        // 处理返回数据，确保包含 createdAt 和 updatedAt 字段
        this.tableData = results.map(item => {
          const data = item.toJSON();
          // 安全地获取 createdAt 和 updatedAt 字段
          let createdAt, updatedAt;

          // 尝试多种方式获取 createdAt
          if (item.createdAt) {
            createdAt = item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt;
          } else if (item.get && item.get('createdAt')) {
            const createdValue = item.get('createdAt');
            createdAt = createdValue.toDate ? createdValue.toDate() : createdValue;
          } else {
            createdAt = data.createdAt;
          }

          // 尝试多种方式获取 updatedAt
          if (item.updatedAt) {
            updatedAt = item.updatedAt.toDate ? item.updatedAt.toDate() : item.updatedAt;
          } else if (item.get && item.get('updatedAt')) {
            const updatedValue = item.get('updatedAt');
            updatedAt = updatedValue.toDate ? updatedValue.toDate() : updatedValue;
          } else {
            updatedAt = data.updatedAt;
          }

          return {
            ...data,
            key: data.objectId,
            createdAt,
            updatedAt
          };
        });
      } catch (error) {
        console.error('获取经典台词数据失败:', error);
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

    // 显示新增对话框
    showAddModal() {
      this.editMode = false;
      this.formData = {
        movieName: '',
        description: '',
        originContent: '',
        picUrl: ''
      };
      this.modalVisible = true;
    },

    // 编辑数据
    handleEdit(row) {
      this.editMode = true;
      this.currentRow = row;
      this.formData = {...row};
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
        let item;
        if (this.editMode) {
          // 编辑模式
          item = this.$leancloud.Object.createWithoutData('classicLinesData', this.currentRow.objectId);
          this.$Message.success('更新成功');
        } else {
          // 新增模式
          const ClassicLinesData = this.$leancloud.Object.extend('classicLinesData');
          item = new ClassicLinesData();
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
        content: '确定要删除这条数据吗？',
        onOk: async () => {
          try {
            const item = this.$leancloud.Object.createWithoutData('classicLinesData', row.objectId);
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
        content: `确定要删除选中的${this.selectedRows.length}条数据吗？`,
        onOk: async () => {
          try {
            const objects = this.selectedRows.map(row =>
              this.$leancloud.Object.createWithoutData('classicLinesData', row.objectId)
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

<style lang="less" scoped>

.options_btn {
  margin-right: 10px;
}

/deep/ .ivu-form-item-label {
  font-weight: bold;
}
</style>

<style lang="less">
.classic-lines-modal {
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
</style>
