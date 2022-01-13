import Vue from 'vue'
import App from './App.vue'
import router from './router'

import fui from '../packages/index.js'
import '../packages/theme-css/lib/index.css'

Vue.use(fui)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
