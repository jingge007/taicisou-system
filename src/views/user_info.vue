<template>
  <div class="user-info-container">
    <Card>
      <div class="filter-container">
        <Form :model="filterForm" :label-width="80" inline>
          <FormItem label="用户名">
            <Input v-model="filterForm.nickname" placeholder="请输入用户名" style="width: 200px"/>
          </FormItem>
          <FormItem>
            <Button type="primary" @click="handleSearch">查询</Button>
            <Button @click="handleReset" style="margin-left: 8px">重置</Button>
          </FormItem>
        </Form>
      </div>

      <div v-viewer="viewerOptions">
        <Table :data="userData" :columns="columns" border :max-height="600">
          <template slot-scope="{ row }" slot="username">
            <span>{{ row.nickname || '-' }}</span>
          </template>
          <template slot-scope="{ row }" slot="avatarUrl">
            <img
              v-if="row.avatarUrl"
              :src="row.avatarUrl"
              alt="用户头像"
              style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer;"
              :data-source="row.avatarUrl"
            />
            <span v-else>无头像</span>
          </template>
          <template slot-scope="{ row }" slot="mobilePhoneNumber">
            <span>{{ row.mobilePhoneNumber || '-' }}</span>
          </template>
          <template slot-scope="{ row }" slot="openid">
            <span>{{ row.openid || '-' }}</span>
            <Icon
              v-if="row.openid"
              type="md-copy"
              :size="20"
              style="margin-left: 5px; cursor: pointer; color: #2D8CF0;"
              @click="copyOpenid(row.openid)"
              title="复制OpenID"/>
          </template>
          <template slot-scope="{ row }" slot="createdAt">
            <span>{{ row.createdAt ? formatDate(new Date(row.createdAt)) : '-' }}</span>
          </template>
          <template slot-scope="{ row }" slot="updatedAt">
            <span>{{ row.updatedAt ? formatDate(new Date(row.updatedAt)) : '-' }}</span>
          </template>
        </Table>
      </div>

      <div style="margin: 10px; overflow: hidden">
        <div style="float: right">
          <Page
            :total="total"
            :current="currentPage"
            :page-size="pageSize"
            @on-change="handlePageChange"
            @on-page-size-change="handlePageSizeChange"
            show-sizer
            show-elevator
            show-total/>
        </div>
      </div>
    </Card>
  </div>
</template>

<style lang="less" scoped>
.user-info-container {
padding-top: 5px;
}

.filter-container {
  margin-bottom: 20px;
}
</style>

<script type="text/ecmascript-6">
import tools from '@/utils/tools';
import { handleLoading } from '@/utils/common';
import commonMixin from '@/utils/common_mixin.js';

export default {
  mixins: [commonMixin],
  data() {
    return {
      filterForm: {
        nickname: ''
      },
      userData: [],
      columns: [
        {
          title: 'OpenID',
          slot: 'openid',
          key: 'openid',
          minWidth: 250
        },
        {
          title: '用户名',
          slot: 'username',
          key: 'nickname',
          minWidth: 130
        },
        {
          title: '用户头像',
          slot: 'avatarUrl',
          key: 'avatarUrl',
          minWidth: 120
        },
        {
          title: '创建时间',
          slot: 'createdAt',
          key: 'createdAt',
          minWidth: 180
        },
        {
          title: '更新时间',
          slot: 'updatedAt',
          key: 'updatedAt',
          minWidth: 180
        }
      ],
      total: 0,
      currentPage: 1,
      pageSize: 20
    };
  },
  created() {
    this.fetchUserData();
  },
  methods: {
    // 日期格式化方法
    formatDate(date) {
      return tools.formatDate(date);
    },

    // 复制OpenID到剪贴板
    copyOpenid(openid) {
      tools.copyText(openid).then(() => {
        this.$Message.success('OpenID已复制到剪贴板');
      }).catch(() => {
        this.$Message.error('复制失败');
      });
    },

    // 获取用户数据
    async fetchUserData() {
      handleLoading(true, '加载用户数据中...');
      try {
        // 直接查询用户数据，而不是使用云函数
        const query = new this.$leancloud.Query('_User');

        // 如果提供了昵称筛选条件
        if (this.filterForm.nickname) {
          query.contains('nickname', this.filterForm.nickname);
        }

        // 设置分页
        query.limit(this.pageSize);
        query.skip((this.currentPage - 1) * this.pageSize);

        // 按创建时间降序排列
        query.descending('createdAt');

        // 执行查询
        const result = await query.find();

        // 获取总数
        const totalQuery = new this.$leancloud.Query('_User');
        if (this.filterForm.nickname) {
          totalQuery.contains('nickname', this.filterForm.nickname);
        }
        const total = await totalQuery.count();

        // 处理返回数据
        this.userData = result.map(user => user.toJSON());
        this.total = total;
      } catch (error) {
        console.error('获取用户数据失败:', error);
        this.$Message.error('获取用户数据失败: ' + error.message);
      } finally {
        handleLoading(false);
      }
    },

    // 查询按钮
    handleSearch() {
      this.currentPage = 1;
      this.fetchUserData();
    },

    // 重置按钮
    handleReset() {
      this.filterForm.nickname = '';
      this.currentPage = 1;
      this.fetchUserData();
    },

    // 分页变化
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchUserData();
    },

    // 页面大小变化
    handlePageSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.fetchUserData();
    }
  }
};
</script>