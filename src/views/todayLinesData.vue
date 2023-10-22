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
      const instance = axios.create();
      instance.get('./originalData.json').then(response => {
        const data = response.data || [];
        if (data.length > 0) {
          // 使用reduce方法进行去重
          let uniqueArr = data.reduce((acc, current) => {
            const x = acc.find(item => item.id === current.id);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);
          // 根据id进行降序排序
          let sortedArr = uniqueArr.sort((a, b) => b.id - a.id);
          /*const blob = new Blob([JSON.stringify(sortedArr)], {type: 'application/json'});
          let nowTime = moment().valueOf();
          let name = `todayLinesData-${nowTime}`;
          FileSaver.saveAs(blob, `${name}.json`);
          window.location.reload()*/
        }
      }).catch(error => {
        console.error('请求失败', error);
      });
    }
  }
}
</script>

<style lang="less" scoped>

</style>