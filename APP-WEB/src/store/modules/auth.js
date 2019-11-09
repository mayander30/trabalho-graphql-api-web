
const state = {
  // this toggles the sidedrawer
  user: {},
  token: ''
};

const mutations = {
    // eslint-disable-next-line no-shadow
	setUser (state, data) {
        state.user = data.user;
        state.token = data.token;
    },

    // eslint-disable-next-line no-shadow
    logout(state) {
        state.user = {};
    }
};

const actions = {
    setUser: ({ commit }, data) => {
        commit("setUser", data);             		
    },

    logout: ({ commit }) => {
        commit("logout");	
	},
};

const getters = {
  // the 'sideDrawer' getter will be available to listen to on the front end.
  // this is the change that we're watching in /app/mixins/sideDrawer.js
  // eslint-disable-next-line no-shadow
  user: (state) => state.user,
    
};

// export this module.
export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
