<template>
  <div class="routeManagement">
    <vueJsonEditor
      v-model="jsonData"
      :mode="'code'"
      lang="zh"
      :showBtns="true"
      @json-save="handleData"
    ></vueJsonEditor>
  </div>
</template>

<script>
import vueJsonEditor from 'vue-json-editor'

export default {
  name: "classicLineData",
  data() {
    return {
      jsonData: null,
      options: {
        language: 'zh-cn',
        theme: 'vs-dark',
        mode: 'tree',
        search: true,
        iconlib: 'fontawesome4'
      }
    }
  },
  methods: {
    // 处理经典台词的数据
    handleData(value) {
      let v = this;
      let newData = [];
      if (value) {
        if (Array.isArray(value)) {
          const query = new v.$leancloud.Query('classicLinesData');
          query.find().then((results) => {
            let newList = results.map(item => item.toJSON()) || [];
            let idList = newList.map((item) => {
              return item.id;
            })
            console.log('-----newList------', idList)
            console.log('----value----', value)
            if (newList.length > 0) {
              newData = value.filter(item => !idList.includes(item.id));
              if (newData.length > 0) {
                sessionStorage.setItem('classicLineData', JSON.stringify(newList));
                v.$Modal.confirm({
                  title: '处理数据成功！',
                  content: `经过数据去重过滤，总共新生成 ${newData.length} 条数据，在经典台词菜单中可以查看具体详情数据。`,
                  onOk: () => {
                    v.$router.push('/todayLinesData');
                  }
                });
              } else {
                v.$Modal.warning('没有新数据生成！');
                return false;
              }
            }
          }).catch((err) => {
            wx.hideLoading();
            console.log('获取经典台词数据失败！', err);
          });
        } else {
          v.$Message.warning('请先输入正确的数据格式！');
          return false;
        }
      } else {
        v.$Message.warning('请先输入数据！');
        return false;
      }
      console.log('++++++jsonData+++++++', value);
    }
  },
  components: {
    vueJsonEditor
  }
}
</script>

<style lang="less" scoped>

.routeManagement {
  width: 100%;
  margin: 0 auto;

  /deep/ .jsoneditor-vue {
    height: 650px;
  }

  /deep/ .json-save-btn {
    cursor: pointer;
    padding: 10px;
    width: 15%;
  }
}
</style>