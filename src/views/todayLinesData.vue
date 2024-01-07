<template>
  <div class="taicisou_system_box">
    <div class="filter_box">
      <Button type="primary" class="options_btn" @click="handleDataBtn">上传数据</Button>
    </div>
    <div class="table_box">
      <Table border :columns="tableColumns" :data="tableData"></Table>
    </div>

  </div>
</template>

<script type="text/ecmascript-6">
import axios from "axios";


export default {
  data() {
    return {
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
        /*{
          title: '海报封面',
          key: 'picUrl',
          align: 'center'
        },*/
        {
          title: '中文台词',
          key: 'description',
          align: 'center'
        },
        {
          title: '英文台词',
          key: 'originContent',
          align: 'center'
        },
        {
          title: '电影名称',
          key: 'movieName',
          align: 'center',
          width: 170,
        },
      ],
      tableData: []
    }
  },
  created() {
    this.getList();
  },
  methods: {
    // 获取列表数据
    getList() {
      this.tableData = [];
      let obj = sessionStorage.getItem('classicLineData');
      if (obj) {
        this.tableData = JSON.parse(obj) || [];
      }
    },
    // 处理经典台词搜的数据
    handleDataBtn() {

    }
  }
}
</script>

<style lang="less" scoped>

</style>