'use babel'
/* globals atom */

import kd from 'kd.js'
import debug from 'debug'
import execa from 'execa'
import KD from './kd-states'
import LoadingView from './views/loading-view'
import TeamSelector from './views/team-selector'
import MachineSelector from './views/machine-selector'
import MountSelector from './views/mount-selector'
import getTeams from './utils/get-teams'
import getMachines from './utils/get-machines'
import getMounts from './utils/get-mounts'

const log = debug('kd-controller:log')
const error = debug('kd:err')

export default class KDController extends kd.Object {

  constructor (serializedState = {}) {
    super({}, serializedState)
    KD.init()
  }

  showLoadingMessage (message, icon, duration) {
    let panel = atom.workspace.addModalPanel({
      className: 'kd-loading-modal',
      item: new LoadingView(message, icon),
      visible: true,
      priority: 201
    })
    if (duration) {
      setTimeout(() => { panel.destroy() }, duration)
    }
    return panel
  }

  _err (e) {
    this.showLoadingMessage(e)
    error(e)
  }

  async showTeams () {
    log('showTeams')
    this.showLoadingMessage('Loading teams…')

    let teams
    try {
      teams = await getTeams()
      this.getData().teams = teams
    } catch (e) { return this._err(e) }

    if (!this.teamSelector) {
      let view = new TeamSelector(teams)
      this.teamSelector = atom.workspace.addModalPanel({
        className: 'kd-team-selector',
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

  async showMounts (showMessage = true) {
    log('showMounts')
    if (showMessage) {
      this.showLoadingMessage('Loading mounts…')
    }
    let mounts
    try {
      mounts = await getMounts()
      this.getData().mounts = mounts
    } catch (e) { return this._err(e) }

    if (!this.mountSelector) {
      let view = new MountSelector(this.getData().mounts)
      this.mountSelector = atom.workspace.addModalPanel({
        className: 'kd-mount-selector',
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

    if (!this.machineSelector) {
      let view = new MachineSelector(machines)
      this.machineSelector = atom.workspace.addModalPanel({
        className: 'kd-machine-selector',
        item: view,
        visible: true,
        priority: 201
      })
      view.emitter.on('machineSelector-cancelled', event => { this.machineSelector.hide() })
      view.emitter.on('machineSelector-confirmed', machine => {
        this.getData().machine = machine
        let localPath = `~/koding/${machine.label}`
        this.showLoadingMessage(`Mounting the machine to <code>~/koding/${machine.label}</code>, please wait…`)
        execa('kd', ['machine', 'mount', machine.id, localPath]).then(result => {
          log(result)
          this.showLoadingMessage(`Machine mounted, preparing the mount please wait…`, 'check')
          this.showMounts(false)
        }).catch(e => {
          error(e)
        })
      })
    } else {
      this.machineSelector.show()
    let machines
    try {
      machines = await getMachines(team)
      this.getData().machines = machines
    } catch (e) { return this._err(e) }
    }
  }

}
