<template>
  <div class="layout">
    <Layout class="layout_content_box">
      <base-sidebar></base-sidebar>
      <Layout class="layout_center_box">
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

export default {
  data() {
    return {
      isCollapsed: false
    };
  },
  components: {
    baseHeader,
    baseSidebar
  }
}
</script>  