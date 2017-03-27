'use babel'

import { Emitter } from 'atom'
import { SelectListView } from 'atom-space-pen-views'

export default class Selector extends SelectListView {

  initialize ({ items, label }) {
    super.initialize(items)
    this.setItems(items)
    this.addClass(`kd-selector kd-${label}-selector overlay from-top`)
    this.emitter = new Emitter()
  }

  attached () {
    this.populateList()
    /* this is to focus the input when it's ready
       if fired right away it doesn't focus */
    setTimeout(() => { this.focusFilterEditor() }, 100)
  }
}
