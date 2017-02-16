'use babel'

import View from './kd-view'

export default class Sidebar extends View {

  constructor (options = {}, data) {
    options.tagName = 'koding-sidebar'
    options.partial = 'mahmut'
    super(options, data)
  }

}
