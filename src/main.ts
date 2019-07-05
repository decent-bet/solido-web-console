import Vue from 'vue';
import Vuetify from 'vuetify';
import App from './App.vue';
import store from './store';

// index.js or main.js
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);
Vue.config.productionTip = false; // Ensure you are using css-loader

new Vue({
  store,
  render: h => h(App),
}).$mount('#app');
