'use babel'

import debug from 'debug'
import Selector from './selector'

const log = debug('kd-mounts:log')

export default class MountSelector extends Selector {

  getFilterKey () {
    return 'name'
  }

  getEmptyMessage () {
    return 'You haven\'t mounted any remote machines yet, please mount a machine first.'
  }

  viewForItem (mount) {
    return `<li>${mount.mount.path} <cite class='pull-right'>${mount.label}</cite></li>`
  }

  confirmed (mount) {
    this.emitter.emit('mountSelector-confirmed', mount)
    return log(`${mount.label} was selected`)
  }

  cancelled () {
    log('MountSelector was cancelled')
    this.emitter.emit('mountSelector-cancelled')
  }
}
