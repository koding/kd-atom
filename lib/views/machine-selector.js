'use babel'

import debug from 'debug'
import { Emitter } from 'atom'
import { SelectListView } from 'atom-space-pen-views'

const log = debug('machineSelector:log')

export default class MachineSelector extends SelectListView {

  initialize (machines) {
    super.initialize(machines)
    this.setItems(machines)
    this.addClass('koding-team-selector overlay from-top')
    this.emitter = new Emitter()
  }

  attached () {
    this.focusFilterEditor()
    this.populateList()
  }

  getFilterKey () {
    return 'name'
  }

  getEmptyMessage () {
    return 'No online machines found, please go to <a href="https://koding.com">koding.com</a> and turn on your machines.'
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
    this.emitter.emit('machineSelector-cancelled')
  }
}
