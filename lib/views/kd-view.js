'use babel'

import kd from 'kd.js'

export default class View extends kd.View {

  constructor (options = {}, data) {
    super(options, data)
    kd.utils.defer(() => { this.emit('viewAppended') })
  }

}
