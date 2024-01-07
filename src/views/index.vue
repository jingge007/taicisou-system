<template>
  <div class="">
    我是首页
  </div>
</template>

<script type="text/ecmascript-6">
import {mapGetters, mapMutations} from 'vuex';

export default {
  data () {
    return {};
  },
  created () {

  },
  computed: {
    ...mapGetters({
      AccessToken: 'access_token'
    })
  },
  methods: {
    // 缓存access_token 值
    ...mapMutations({
      setAccessToken: 'ACCESSTOKEN'
    })
  }
};
</script>
