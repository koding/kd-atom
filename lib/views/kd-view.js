'use babel'

import kd from 'kd.js'

export default class View extends kd.View {

  constructor (options = {}, data) {
    super(options, data)
    if (options.appended) {
      kd.utils.defer(() => { this.emit('viewAppended') })
    }
  }

}
