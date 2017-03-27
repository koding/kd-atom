'use babel'

import debug from 'debug'
import Selector from './selector'

const log = debug('kd-teams:log')

export default class TeamSelector extends Selector {

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
