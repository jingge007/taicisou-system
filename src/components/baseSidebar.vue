<template>
  <Sider hide-trigger
    collapsible
    class="header_box"
    :collapsed-width="65"
    :width="240"
    v-model="isCollapsed"
    :class="themeType==='light'?'themeLight':'themeDark'">
    <div class="logo_box" v-if="!isCollapsed" @click="logoBtn">
      <img class="head_logo" src="../assets/images/head_logo.png" alt="">
      <h2 class="title">台词搜管理系统</h2>
    </div>
    <div class="logo_box" v-else @click="logoBtn">
      <img class="mini_head_logo" src="../assets/images/head_logo.png" alt="">
    </div>
    <Menu :theme="theme"
      width="auto"
      ref="side_menu"
      class="menu_box"
      @on-select="SelectNav"
      :class="isCollapsed ? 'menu_style' : ''"
      :active-name="activeName"
      :style="{height: 'calc(100% - 60px)'}">
      <template v-for="(item, index) in SubmenuList">
        <!--展开并且有子菜单-->
        <Submenu :name="item.name" :key="index" v-if="!isCollapsed && !item.singlePage">
          <template slot="title">
            <base-icon :name="item.icon" :size="item.icon_size"></base-icon>
            <span class="text">{{ item.title }}</span>
          </template>
          <MenuItem v-for="(ele, ids) in item.children" :key="ids" :name="ele.name">{{ ele.title }}</MenuItem>
        </Submenu>
        <!--展开但没有子菜单-->
        <MenuItem :name="item.name" :key="index" v-if="!isCollapsed && item.singlePage">
          <base-icon
            :name="item.icon"
            :size="item.icon_size"
            :color="item.name === activeName ? '#2d8cf0' : '#666'"></base-icon>
          <span class="text">{{ item.title }}</span>
        </MenuItem>
        <!--不展开有子菜单-->
        <Dropdown :key="index"
          v-if="isCollapsed && !item.singlePage"
          class="icon_style"
          transfer-class-name="dropdown_box"
          @on-click="SelectNav"
          placement="right">
          <base-icon :name="item.icon"
            :size="item.size"
            :color="item.name === activeName ? '#2d8cf0' : '#666'"></base-icon>
          <DropdownMenu slot="list">
            <DropdownItem v-for="(ele, ids) in item.children"
              :key="ids"
              :name="ele.name"
              :selected="item.name === activeName">
              {{ ele.title }}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <!--不展开无子菜单-->
        <Dropdown :key="index"
          v-if="isCollapsed && item.singlePage"
          class="icon_style"
          transfer-class-name="dropdown_box"
          @on-click="SelectNav"
          placement="right">
          <base-icon :name="item.icon"
            :size="item.size"
            :color="item.name === activeName ? '#2d8cf0' : '#666'"></base-icon>
          <DropdownMenu slot="list">
            <DropdownItem :name="item.name">{{ item.title }}</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </template>
    </Menu>
  </Sider>
</template>
<style lang="less" scoped>
.header_box {
  background: #fff;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;

  .logo_box {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #f8f8f9;
    border-right: 1px solid #f1f1f2;
    box-shadow: 2px 7px 8px 0 rgba(29, 35, 41, 0.05);
    box-sizing: border-box;
    cursor: pointer;

    .head_logo {
      width: 50px;
      height: 50px;
      display: block;
    }

    .mini_head_logo {
      display: block;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      overflow: hidden;
    }

    .title {
      font-size: 18px;
      font-weight: bold;
    }
  }

  .menu_box {
    overflow-y: auto;
    box-shadow: 2px 7px 8px 0 rgba(29, 35, 41, 0.05);
    height: calc(100vh - 60px);
    position: relative;

    /deep/ .ivu-menu-submenu-title, /deep/ .ivu-menu-item {
      display: flex;
      align-items: center;

      .text {
        margin-left: 10px;
      }
    }

    .icon_style {
      padding: 12px 0;
      cursor: pointer;

      &:hover {

      }
    }
  }

  .menu_style {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>

<script type="text/ecmascript-6">
import {mapGetters} from 'vuex';
import {menuConfig} from '@/utils/navConfig';

export default {
  data() {
    return {
      themeType: 'light',
      theme: 'light',
      SubmenuList: menuConfig,
      activeName: '' // 子导航选中的name
    };
  },
  computed: {
    ...mapGetters({
      isCollapsed: 'isCollapsed'
    })
  },
  created() {
    if (this.$refs.side_menu) {
      this.$refs.side_menu.updateOpened();
    }
    this.activeName = this.$route.name;
  },
  methods: {
    // 跳转路由
    SelectNav(name) {
      this.activeName = name;
      this.$router.push({
        name: name
      }).catch(() => {
      });
    },
    // 跳转到首页
    logoBtn() {
      this.$router.push({
        path: '/'
      }).catch(() => {
      });
      ;
    }
  },
  watch: {
    isCollapsed: {
      handler(val) {
        // 重新渲染导航
        this.$nextTick(() => {
          this.$refs.side_menu.updateOpened();
          this.$refs.side_menu.updateActiveName();
        });
      },
      deep: true
    }
  }
};
</script>