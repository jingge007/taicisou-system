<template>
  <div class="">
    我是首页
  </div>
</template>

<script type="text/ecmascript-6">
import {GetAccessToken, GetUserPortrait} from '@/api/api';
import {mapGetters, mapMutations} from 'vuex';

export default {
  data () {
    return {};
  },
  created () {
    // if (!this.AccessToken) {
    //   this.GetAccessTokenData();
    // } else {
    //   this.GetUserPortraitData();
    // }
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
    }),
    // 获取小程序的access_token值
    GetAccessTokenData () {
      let query = {
        grant_type: 'client_credential',
        appid: 'wxebfc4b90f4fd1bae',
        secret: '4755c8ddde56f98f6d61b5725f7f88a8'
      };
      GetAccessToken(query).then((res) => {
        let access_token = res.access_token;
        this.setAccessToken(access_token);
        this.GetUserPortraitData(access_token);
      }).catch((err) => {
        console.log('-----------', err);
      });
    },
    //
    GetUserPortraitData (access_token) {
      let token = access_token || this.AccessToken;
      let query = {
        begin_date: '2020-06-01',
        end_date: '2020-11-02'
      };
      GetUserPortrait(query, token).then((res) => {
        console.log('+++++++++++=', res);
      }).catch((err) => {
        console.log('-----------', err);
      });
    }
  }
};
</script>
