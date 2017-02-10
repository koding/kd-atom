'use babel'

const kd = require('kd.js')
const Sidebar = require('./views/sidebar')

export default class KodingView extends kd.Object {

  constructor (serializedState) {
    super({}, serializedState)
    this.sidebar = new Sidebar()
    kd.utils.defer(() => { this.sidebar.emit('viewAppended') })
  }

  destroy () {
    // allow GC to clean kd.js allocated memory
    this.sidebar.destroy()
  }

  getElement () {
    return this.sidebar.getElement()
  }

}
