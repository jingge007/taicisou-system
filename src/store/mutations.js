import * as types from './mutation-types';

const mutations = {
    [types.ISCOLLAPSED](state, data) {
        state.isCollapsed = data;
    },
    [types.ACCESSTOKEN](state, data) {
      state.access_token = data;
    }
};

export default mutations;
