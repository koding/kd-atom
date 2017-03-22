'use babel'

import debug from 'debug'
import { Emitter } from 'atom'
import { SelectListView } from 'atom-space-pen-views'

const log = debug('teamSelector:log')

export default class TeamSelector extends SelectListView {

  initialize (teams) {
    super.initialize(teams)
    this.setItems(teams)
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
    return 'No teams found!'
  }

  viewForItem (team) {
    return `<li>${team.name} <cite class='pull-right'>${team.slug}.koding.com</cite></li>`
  }

  confirmed (team) {
    this.emitter.emit('teamSelector-confirmed', team)
    return log(`${team.name} was selected`)
  }

  cancelled () {
    log('TeamSelector was cancelled')
    this.emitter.emit('teamSelector-cancelled')
  }
}
