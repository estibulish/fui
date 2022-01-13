const fs = require('fs')
const path = require('path')
const join = path.join

function resolve (dir) {
  return path.resolve(__dirname, dir)
}

// 实现自动化多入口文件的配置
function getEntries (path) {
  const files = fs.readdirSync(resolve(path))
  const entries = files.reduce((ret, item) => {
    const itemPath = join(path, item)
    const isDir = fs.statSync(itemPath).isDirectory()
    if (isDir) {
      if (item.indexOf('theme-css') !== -1) return ret
      ret[item] = resolve(join(itemPath, 'index.js'))
    } else {
      const [name] = item.split('.')
      ret[name] = resolve(itemPath)
    }
    return ret
  }, {})
  console.log(entries)
  return entries
}

// 开发环境
const DEV_CONFIG = {
  pages: {
    index: {
      entry: 'examples/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  chainWebpack: config => {
    // 重新设置目录别名
    config.resolve.alias
      .set('@', path.resolve('examples'))
      .set('~', path.resolve('packages'))
    // 使 examples及packages目录下的js文件都加入编译
    config.module
      .rule('js')
      .include.add('/packages')
      .end()
      .include.add('/examples')
      .end()
      .use('babel')
      .loader('babel-loader')
      .tap(options => {
        return options
      })
    // 使用vue-markdown-loader
    // config.module.rule('md')
    //   .test(/\.md/)
    //   .use('vue-loader')
    //   .loader('vue-loader')
    //   .end()
    //   .use('vue-markdown-loader')
    //   .loader('vue-markdown-loader/lib/markdown-compiler')
  }
}

// 生产环境
const PROD_CONFIG = {
  // 配置组件库编译打包生成资源的存放位置
  outputDir: 'lib',
  // 关闭source map
  productionSourceMap: false,
  // 配置组件样式编译打包生成资源的存放位置
  css: {
    extract: {
      filename: 'style/[name].css'
    }
  },
  chainWebpack: config => {
    // 使 examples及packages目录下的js文件都加入编译
    config.module
      .rule('js')
      .include.add('/packages')
      .end()
      .include.add('/examples')
      .end()
      .use('babel')
      .loader('babel-loader')
      .tap(options => {
        return options
      })
    // 把 entry 中 app 这个键值对删除，然后用 configureWebpack 来添加 entry
    config.entryPoints.delete('app')
    // 删除splitChunks，因为每个组件是独立打包，不需要抽离每个组件的公共js出来
    // 删除copy，不要复制public文件夹内容到lib文件夹中
    // 删除html，只打包组件，不生成html页面
    // 删除preload以及prefetch，因为不生成html页面，所以这两个也没用
    // 删除hmr，删除热更新
    config.optimization.delete('splitChunks')
    config.plugins.delete('copy')
    config.plugins.delete('html')
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
    config.plugins.delete('hmr')
  },
  configureWebpack: {
    // 实现多入口编译打包组件库
    entry: {
      ...getEntries('packages')
      // index: path.resolve(__dirname, 'packages/index.js'),
      // button: path.resolve(__dirname, 'packages/button/index.js')
    },
    output: {
      // [name] 就是 entry 选项中的键名
      filename: '[name]/index.js',
      // 意味打包出来的文件将用于 CommonJS 环境
      libraryTarget: 'commonjs2'
    }
  }
}

// NODE_ENV 来区分是开发环境还是生产环境
module.exports = process.env.NODE_ENV === 'development' ? DEV_CONFIG : PROD_CONFIG
