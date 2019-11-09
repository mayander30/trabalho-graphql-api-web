
const state = {
  // this toggles the sidedrawer
  lstRegisters: []
};

const mutations = {
    // eslint-disable-next-line no-shadow
	setRegisters (state, data) {
        state.lstRegisters = data.lstRegisters;
    },

};

const actions = {
    setRegisters: ({ commit }, data) => {
        commit("setRegisters", data);             		
    },

};

const getters = {

};

// export this module.
export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
