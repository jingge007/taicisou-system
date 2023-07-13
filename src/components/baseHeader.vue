<template>
  <div class="header_box" :style="headerStyle">
    <div class="header_left">
      <Icon style="cursor: pointer; margin-right: 40px;" @click.native="collapsedSider" type="md-menu" size="26"></Icon>
      <Breadcrumb>
        <BreadcrumbItem>台词搜</BreadcrumbItem>
        <BreadcrumbItem>{{ $route.meta.title }}</BreadcrumbItem>
      </Breadcrumb>
    </div>
    <div class="header_right">
      <Icon style="cursor: pointer;" :type="isMaxWindow?'md-contract':'md-expand'" @click="maxWindow" size="24"/>
      <Dropdown @on-click="personalSettings" transfer-class-name="header_dropdown">
        <div class="header_center">
          <img class="header_logo" src="../assets/images/head_logo.png" alt=""> <span class="text">admin</span>
        </div>
        <DropdownMenu slot="list">
          <DropdownItem name="grzx">个人中心</DropdownItem>
          <DropdownItem name="sz">设置</DropdownItem>
          <DropdownItem name="logout" divided>退出登录</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  </div>
</template>

<style lang="less" scoped>
.header_box {
  display: flex;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
  width: calc(100% - 240px);
  position: fixed;
  top: 0;
  right: 0;
  left: 240px;
  z-index: 11;
  height: 60px;
  line-height: 60px;
  background-color: #fff;
  padding: 0 20px;
  box-sizing: border-box;

  /deep/ .ivu-breadcrumb {
    font-size: 15px;
  }

  .header_left {
    display: flex;
    align-items: center;
  }

  .header_right {
    display: flex;
    align-items: center;
    padding-right: 50px;

    /deep/ .ivu-dropdown-rel {
      display: flex;
      align-items: center;
      height: 60px;
      margin-left: 20px;
      cursor: pointer;
    }

    .header_center {
      display: flex;
      align-items: center;

      .header_logo {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 1px solid #f1f1f2;
        box-shadow: 2px 7px 8px 0 rgba(29, 35, 41, 0.05);
      }

      .text {
        margin-left: 15px;
        font-size: 14px;
        color: #333;
      }
    }
  }
}
</style>

<script type="text/ecmascript-6">
import {mapGetters, mapMutations} from 'vuex';

export default {
  data() {
    return {
      isMaxWindow: false // 是否最大化窗口
    };
  },
  computed: {
    ...mapGetters({
      isCollapsed: 'isCollapsed'
    }),
    headerStyle() {
      let style = {
        left: '65px',
        width: 'calc(100% - 65px)'
      };
      return this.isCollapsed
        ? style
        : '';
    }
  },
  methods: {
    // 获取侧边栏的变量参数
    ...mapMutations({
      setIsCollapsed: 'ISCOLLAPSED'
    }),
    // 展开与收起侧边栏
    collapsedSider() {
      this.setIsCollapsed(!this.isCollapsed);
    },
    // 窗口最大化
    maxWindow() {
      if (this.isMaxWindow) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        this.isMaxWindow = false;
      } else {
        let element = document.documentElement;
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
        this.isMaxWindow = true;
      }
    },
    // 头部的下拉框
    personalSettings(name) {
      if (name === 'logout') {
        this.$router.push({
          path: '/login'
        });
      }
    }
  }
};
</script>