'use babel'

import debug from 'debug'
import { Emitter } from 'atom'
import { SelectListView } from 'atom-space-pen-views'

const log = debug('mountSelector:log')

export default class MountSelector extends SelectListView {

  initialize (mounts) {
    super.initialize(mounts)
    this.setItems(mounts)
    this.addClass('koding-mount-selector overlay from-top')
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
    return 'You haven\'t mounted any remote machines yet, please mount a machine first.'
  }

  viewForItem (mount) {
    return `<li>${mount.Mount.path} <cite class='pull-right'>${mount.label}</cite></li>`
  }

  confirmed (mount) {
    this.emitter.emit('mountSelector-confirmed', mount)
    return log(`${mount.label} was selected`)
  }

  cancelled () {
    log('TeamSelector was cancelled')
    this.emitter.emit('mountSelector-cancelled')
  }
}
