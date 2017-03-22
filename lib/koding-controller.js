'use babel'
/* globals atom */

import kd from 'kd.js'
import debug from 'debug'
import execa from 'execa'
import KD from './kd-states'
import TeamSelector from './views/team-selector'
import MachineSelector from './views/machine-selector'
import MountSelector from './views/mount-selector'
import getTeams from './utils/get-teams'
import getMachines from './utils/get-machines'
import getMounts from './utils/get-mounts'

const log = debug('controller:log')
const error = debug('app:err')

export default class KodingController extends kd.Object {

  constructor (serializedState = {}) {
    super({}, serializedState)
    KD.init()
  }

  }

  async showTeams () {
    log('showTeams')
    this.showLoadingMessage('Loading teams…')
    let teams = await getTeams()
    this.getData().teams = teams

    if (!this.teamSelector) {
      let view = new TeamSelector(this.getData().teams)
      this.teamSelector = atom.workspace.addModalPanel({
        className: 'koding-team-selector',
        item: view,
        visible: true,
        priority: 201
      })
      view.emitter.on('teamSelector-cancelled', event => { this.teamSelector.hide() })
      view.emitter.on('teamSelector-confirmed', team => {
        this.getData().team = team
        this.showMachines(team.slug)
      })
    } else {
      this.teamSelector.show()
    }
  }

  async showMounts () {
    log('showMounts')
    let mounts = await getMounts()
    this.getData().mounts = mounts

    if (!this.mountSelector) {
      let view = new MountSelector(this.getData().mounts)
      this.mountSelector = atom.workspace.addModalPanel({
        className: 'koding-mount-selector',
        item: view,
        visible: true,
        priority: 201
      })
      view.emitter.on('mountSelector-cancelled', event => { this.mountSelector.hide() })
      view.emitter.on('mountSelector-confirmed', mount => {
        this.getData().mount = mount
        atom.workspace.project.addPath(mount.Mount.path)
      })
    } else {
      this.mountSelector.show()
    }
  }

  async showMachines (team) {
    log('showMachines')
    this.showLoadingMessage('Loading machines…')
    let machines = await getMachines(team)
    this.getData().machines = machines

    if (!this.machineSelector) {
      let view = new MachineSelector(machines)
      this.machineSelector = atom.workspace.addModalPanel({
        className: 'koding-machine-selector',
        item: view,
        visible: true,
        priority: 201
      })
      view.emitter.on('machineSelector-cancelled', event => { this.machineSelector.hide() })
      view.emitter.on('machineSelector-confirmed', machine => {
        this.getData().machine = machine
        execa('kd', ['machine', 'mount', machine.id, `~/koding/${machine.label}`]).then(result => {
          log(result)
        }).catch(e => {
          error(e)
        })
      })
    } else {
      this.machineSelector.show()
    }
  }

}
