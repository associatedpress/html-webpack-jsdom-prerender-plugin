# html-webpack-jsdom-prerender-plugin

A plugin to prerender and inject JavaScript apps into the static markup
generated by
[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) at build
time. This was heavily inspired by
[html-webpack-prerender-plugin](https://github.com/reuters-graphics/html-webpack-prerender-plugin)
by Reuters Graphics.

## Getting Started

1. Install this package and `html-webpack-plugin` as dev dependencies
   ```
   yarn add --dev html-webpack-plugin html-webpack-jsdom-prerender-plugin
   ```

2. Add the plugins to your webpack configuration
   ```js
   // webpack.config.js
   const HtmlWebpackPlugin = require('html-webpack-plugin')
   const HtmlWebpackJsdomPrerenderPlugin = require('html-webpack-jsdom-prerender-plugin')
   
   module.exports = {
     entry: './src/js/index.js',
     output: {
       path: './dist',
       filename: '[name].js',
     },
     // ...
     plugins: [
       new HtmlWebpackPlugin({
         filename: 'index.html',
         template: './src/templates/index.html',
       }),
       new HtmlWebpackJsdomPrerenderPlugin({
         'index.html': {
           chunks: ['main'],
         },
       }),
     ],
   }
   ```

3. Create an HTML template for your app
   ```html
   <!-- src/templates/index.html -->
   <!DOCTYPE html>
   <html lang="en" dir="ltr">
     <head></head>
     <body>
       <div id='root'></div>
     </body>
   </html>
   ```

4. Make sure your app will change the DOM when it runs. If you're using
   a framework like React you can use the flag
   `window.__HTML_WEBPACK_JSDOM_PRERENDER_PLUGIN__` to see if your app is
   running in a prerender environment rather than on the client.
   ```js
   // src/js/index.js
   import React from 'react'
   import { render } from 'react-dom'
   import { renderToString } from 'react-dom/server'
   import Component from './my-component'

   const node = document.getElementById('root')
   if (window.__HTML_WEBPACK_JSDOM_PRERENDER_PLUGIN__) {
     node.innerHTML = renderToString(<Component />)
   } else {
     render(<Component />, node)
   }
   ```

   **Note** The plugin only currently supports two types of `publicPath`: "auto" (the same behavior as  if the publicPath is excluded) and a path relative to the root, for example "/assets".
