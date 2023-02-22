import HtmlWebpackPlugin from 'html-webpack-plugin'
import jsdom from 'jsdom'
import chalk from 'chalk'
import { validate } from 'schema-utils'
import optionsSchema from './schema'
import StringResourceLoader from './string_resource_loader'

const pluginName = 'HtmlWebpackJsdomPrerenderPlugin'
const errorLabel = `${pluginName} ${chalk.red('ERROR:')}`
const warnLabel = `${pluginName} ${chalk.yellow('Warning:')}`

class HtmlWebpackJsdomPrerenderPlugin {
  constructor(options = {}) {
    validate(optionsSchema, options, pluginName)
    this.options = this.areShallowOptions(options)
      ? { 'index.html': options }
      : options
  }

  areShallowOptions(options) {
    const testKey = Object.keys(options)[0]
    return typeof options[testKey] === 'string' || options[testKey].selector
  }

  findAsset(entry, compilation) {
    const webpackStats = compilation.getStats()
    const webpackStatsJson = webpackStats.toJson()

    let outputFile = webpackStatsJson.assetsByChunkName[entry]

    if (!outputFile) return null

    // Webpack outputs an array for each chunk when using sourcemaps
    if (outputFile instanceof Array) {
    // Is the main bundle always the first element?
      outputFile = outputFile.find(function(filename) {
        return /\.js$/.test(filename)
      });
    }
    if (!/\.js$/.test(outputFile)) return null
    return { outputFile, asset: compilation.assets[outputFile] }
  }

  async injectApp(entry, html, compilation) {
    const { outputFile, asset } = this.findAsset(entry, compilation)

    if (!asset) return html

    const source = asset.source()

    const baseUrl = 'http://localhost'
    let filePath = outputFile
    const publicPath = compilation.options.output?.publicPath
    // Use correct publicPath, for now only for paths beginning with /
    if (publicPath && publicPath.indexOf('/') === 0) {
      filePath = `${publicPath}${outputFile}`
    }
    const scriptUrl = new URL(filePath, baseUrl).href; // Load source of script as string

    // Load source of script as string
    const resourceLoader = new StringResourceLoader({ [scriptUrl]: source })

    const dom = await new Promise((resolve, reject) => {
      const virtualDOM = new jsdom.JSDOM(html, {
        // suppress console-proxied eval() errors, but keep console proxying
        virtualConsole: new jsdom.VirtualConsole({ omitJSDOMErrors: false }).sendTo(console),

        // `url` sets the value returned by `window.location`, `document.URL`...
        // Useful for routers that depend on the current URL (such as react-router or reach-router)
        url: baseUrl,

        // don't track source locations for performance reasons
        includeNodeLocations: false,

        // don't allow inline event handlers & script tag exec
        runScripts: 'dangerously',

        // load our custom resources from webpack
        resources: resourceLoader,

        // set things up before parsing the HTML
        beforeParse(window) {
          // let our code know that we're in a prerender environment
          window.__HTML_WEBPACK_JSDOM_PRERENDER_PLUGIN__ = true

          // wait for window 'load' event before resolving
          window.addEventListener('load', () => {
            resolve(virtualDOM)
          })
        },
      })
    })

    return dom.serialize()
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        pluginName,
        async(data, cb) => {
          const outputName = data.outputName || data.plugin.childCompilationOutputName

          if (!(outputName in this.options)) return cb(null, data)

          const chunks = this.options[outputName].chunks

          let html = data.html
          for (const chunk of chunks) {
            try {
              html = await this.injectApp(chunk, html, compilation)
            } catch (e) {
              return cb(e, data)
            }
          }

          data.html = html

          return cb(null, data)
        }
      )
    })
  }
}

export default HtmlWebpackJsdomPrerenderPlugin
