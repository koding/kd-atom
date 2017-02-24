'use babel'

import debug from 'debug'
import { Emitter } from 'atom'
import { SelectListView } from 'atom-space-pen-views'

const log = debug('controller:log')

export default class TeamSelector extends SelectListView {

  initialize (teams) {
    super.initialize(teams)
    this.addClass('koding-team-selector overlay from-top')
    this.emitter = new Emitter()
    this.roles = teams.map(team => { return team.roles })
    this.teams = teams.map(team => { return team.group })
    this.setItems(this.teams)
  }

  attached () {
    this.focusFilterEditor()
    this.populateList()
  }

  getFilterKey () {
    return 'title'
  }

  viewForItem (team) {
    return `<li>${team.title} <cite class='pull-right'>${team.slug}.koding.com</cite></li>`
  }

  confirmed (team) {
    this.emitter.emit('teamSelector-confirmed', team)
    return log(`${team.title} was selected`)
  }

  cancelled () {
    log('TeamSelector was cancelled')
    this.emitter.emit('teamSelector-cancelled')
  }
}
