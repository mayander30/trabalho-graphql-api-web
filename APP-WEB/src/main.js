import Vue from 'vue'
import App from './App.vue'

import { HttpLink } from 'apollo-link-http';

import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';

import store from './store/index.js';

import VueApollo from 'vue-apollo';

const httpLink = new HttpLink({
    // You should use an absolute URL here
    uri: 'http://localhost:4000/',
});

const middlewareLink = setContext(() => ({
    headers: {
      authorization: `Bearer ${store.state.auth.token}`
    }
}));

const apolloClient = new ApolloClient({
    link:  middlewareLink.concat(httpLink),
    cache: new InMemoryCache(),
    connectToDevTools: true
})


const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
    defaultOptions: {
        $loadingKey: 'loading'
    },
    connectToDevTools: true,
})
  
  // 5
Vue.use(VueApollo)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  store,
  provide: apolloProvider.provide(),
}).$mount('#app')
