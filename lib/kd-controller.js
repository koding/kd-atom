'use babel'
/* globals atom */

import kd from 'kd.js'
import debug from 'debug'
import execa from 'execa'
import KD from './kd-states'
import LoadingView from './views/loading-view'
import PromptView from './views/prompt-view'
import TeamSelector from './views/team-selector'
import MachineSelector from './views/machine-selector'
import MountSelector from './views/mount-selector'
import getTeams from './utils/get-teams'
import getMachines from './utils/get-machines'
import getMounts from './utils/get-mounts'
import showTreeView from './utils/show-tree-view'

const log = debug('kd-controller:log')
const error = debug('kd:err')

export default class KDController extends kd.Object {

  constructor (serializedState = {}) {
    super({}, serializedState)
    KD.init()

    this.modalPanel = null
  }

  showLoadingMessage (message, icon, duration) {
    this.modalPanel = atom.workspace.addModalPanel({
      className: 'kd-loading-modal',
      item: new LoadingView(message, icon),
      visible: true,
      priority: 201
    })

    if (duration) {
      setTimeout(() => this.modalPanel.destroy(), duration)
    }

    return this.modalPanel
  }

  showPrompt (prompts, callback) {
    let view = new PromptView(prompts)

    let panel = atom.workspace.addModalPanel({
      className: 'kd-loading-modal',
      item: view,
      visible: true,
      priority: 201
    })
    view.emitter.on('prompt-given', userInputs => {
      callback(null, userInputs)
    })
    view.emitter.on('prompt-cancelled', () => {
      callback(true)
    })
    return panel
  }

  _err (e) {
    if (this.modalPanel) {
      this.modalPanel.destroy()
      this.modalPanel = null
    }

    atom.notifications.addFatalError(`kd: ${e}`, {
      dismissable: true,
      stack: e.stack
    })

    error(e)
  }

  _showSelector (items, selector) {
    selector.getItem().setItems(items)
    selector.getItem().attached()
    selector.show()
  }

  async showTeams () {
    log('showTeams')
    this.showLoadingMessage('Loading teams…')

    let teams
    try {
      teams = await getTeams()
      this.getData().teams = teams
    } catch (e) { return this._err(e) }

    if (this.teamSelector) {
      return this._showSelector(teams, this.teamSelector)
    }

    let view = new TeamSelector({ items: teams, label: 'team' })
    this.teamSelector = atom.workspace.addModalPanel({
      className: 'kd-team-selector',
      item: view,
      visible: true,
      priority: 201
    })
    view.emitter.on('teamSelector-cancelled', event => {
      this.teamSelector.hide()
    })
    view.emitter.on('teamSelector-confirmed', team => {
      this.getData().team = team
      this.showMachines(team.slug)
    })
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

    if (this.mountSelector) {
      return this._showSelector(mounts, this.mountSelector)
    }

    let view = new MountSelector({
      items: this.getData().mounts,
      label: 'mount'
    })
    this.mountSelector = atom.workspace.addModalPanel({
      className: 'kd-mount-selector',
      item: view,
      visible: true,
      priority: 201
    })
    view.emitter.on('mountSelector-cancelled', event => {
      this.mountSelector.hide()
    })
    view.emitter.on('mountSelector-confirmed', mount => {
      this.getData().mount = mount
      atom.workspace.project.addPath(mount.mount.path)
      showTreeView()
    })
  }

  async showMachines (team) {
    log('showMachines')
    this.showLoadingMessage('Loading machines…')

    let machines
    try {
      machines = await getMachines(team)
      this.getData().machines = machines
    } catch (e) { return this._err(e) }

    if (this.machineSelector) {
      return this._showSelector(machines, this.machineSelector)
    }

    let view = new MachineSelector({ items: machines, label: 'machine' })
    this.machineSelector = atom.workspace.addModalPanel({
      className: 'kd-machine-selector',
      item: view,
      visible: true,
      priority: 201
    })

    view.emitter.on('machineSelector-cancelled', event => (
      this.machineSelector.hide()
    ))
    view.emitter.on('machineSelector-confirmed', machine => {
      this.getData().machine = machine

      const localBasePath = atom.config.get('kd.localBasePath')
      const localPath = `${localBasePath}/${machine.team}/${machine.label}`
      const remotePath = `/home/${machine.owner || machine.username}`

      let panel = this.showPrompt({
        prompts: [
          {
            name: 'localPath',
            title: 'Local path:',
            defaultValue: localPath,
            placeholder: localPath
          },
          {
            name: 'remotePath',
            title: 'Remote path:',
            defaultValue: remotePath,
            placeholder: remotePath
          }
        ],
        callback: (err, inputs) => {
          if (err) return panel.destroy()
          panel.destroy()
          let remoteAddress = `${machine.id}:${inputs.remotePath}`
          this.showLoadingMessage(
            getMountingMessage(remoteAddress, inputs.localPath)
          )
          execa('kd', ['machine', 'mount', remoteAddress, inputs.localPath])
            .then(result => {
              this.showLoadingMessage(getMountedMessage(), 'check', 2000)
              atom.workspace.project.addPath(localPath)
              showTreeView()
            }).catch(e => {
              this.showLoadingMessage(getMountError(), 'x', 2000)
              error(e)
            })
        }
      })
    })
  }
}

const getMountingMessage = (remote, local) => (`
  Mounting <code>${remote}</code> to
  <code>${local}</code>, please wait…
`)

const getMountedMessage = () => (`
  Machine mounted, preparing the mount please wait…
`)

const getMountError = () => (`
  Machine could not be mounted, rolling back…
`)
