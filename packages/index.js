
import FButton from '../packages/button/index.js'
import FButtonGroup from '../packages/button-group/index.js'

const components = [
  FButton,
  FButtonGroup
]

const install = function (Vue) {
  if (install.installed) return
  components.map(component => Vue.component(component.name, component))
}

if (typeof window.Vue !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  install,
  FButton,
  FButtonGroup
}
