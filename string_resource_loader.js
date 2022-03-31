import jsdom from 'jsdom'

export default class StringResourceLoader extends jsdom.ResourceLoader {
  constructor(resources = {}) {
    super()
    this._resources = resources
  }

  fetch(url, options) {
    const source = this._resources[url] || ''
    return Promise.resolve(Buffer.from(source))
  }
}
