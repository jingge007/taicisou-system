<template>
  <div class="layout">
    <Layout class="layout_content_box">
      <base-sidebar></base-sidebar>
      <Layout class="layout_center_box" :style="centerBoxStyle">
        <base-header></base-header>
        <Content class="content_box">
          <router-view></router-view>
        </Content>
      </Layout>
    </Layout>
  </div>
</template>

<style lang="less" scoped>
.layout {
  .layout_content_box {
    display: flex;
    flex-direction: row;

    .layout_center_box {
      display: flex;
      flex-direction: column;
      flex: auto;
      overflow-y: auto;
      transition: all 0.2s ease-in-out;

      .content_box {
        margin: 75px 20px 20px 20px;
        height: 100%
      }
    }
  }
}
</style>

<script type="text/ecmascript-6">
import baseHeader from "@/components/baseHeader";
import baseSidebar from "@/components/baseSidebar";
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
    };
  },
  components: {
    baseHeader,
    baseSidebar
  },
  computed: {
    ...mapGetters({
      isCollapsed: 'isCollapsed'
    }),
    centerBoxStyle() {
      return {
        marginLeft: this.isCollapsed ? '65px' : '240px',
        width: this.isCollapsed ? 'calc(100% - 65px)' : 'calc(100% - 240px)'
      };
    }
  }
}
</script>
