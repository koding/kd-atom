'use babel'

import debug from 'debug'
import Selector from './selector'

const log = debug('kd-machines:log')

export default class MachineSelector extends Selector {

  getFilterKey () {
    return 'name'
  }

  getEmptyMessage () {
    return 'No online machines found, please go to koding.com and turn on your machines.'
  }

  viewForItem (machine) {
    return `<li>${machine.label} <cite class='pull-right'>${machine.id}</cite></li>`
  }

  confirmed (machine) {
    this.emitter.emit('machineSelector-confirmed', machine)
    return log(`${machine.label} was selected`)
  }

  cancelled () {
    log('MachineSelector was cancelled')
    this.setItems([])
    this.emitter.emit('machineSelector-cancelled')
  }
}
