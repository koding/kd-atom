'use babel'
/* globals atom */

import kd from 'kd.js'
import debug from 'debug'
import execa from 'execa'
import KD from './kd-states'
import PromptView from './views/prompt-view'
import TeamSelector from './views/team-selector'
import MachineSelector from './views/machine-selector'
import MachineSettings from './views/machine-settings'
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

  showLoading (message, duration) {
    KD.emitter.emit('kd-state-loading', message)
    if (duration) {
      setTimeout(this.bound('hideLoading'), duration)
    }
  }

  hideLoading () {
    KD.emitter.emit('kd-state-loading-finished')
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

    this.hideLoading()

    atom.notifications.addFatalError(`kd: ${e}`, {
      dismissable: true,
      stack: e.stack
    })

    error(e)
  }

  _showSelector (items, selector) {
    this.hideLoading()
    selector.getItem().setItems(items)
    selector.getItem().attached()
    selector.show()
  }

  hideSelectors () {
    this.teamSelector && this.teamSelector.hide()
    this.machineSelector && this.machineSelector.hide()
    this.mountSelector && this.mountSelector.hide()
  }

  showTeamsSelector (teams, options = {}) {
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
      options.onCancel && options.onCancel()
    })
    view.emitter.on('teamSelector-confirmed', team => {
      this.teamSelector.hide()
      options.onConfirm && options.onConfirm(team)
    })

    return teams
  }

  async showTeams () {
    log('showTeams')
    this.showLoading('Loading teams…')

    let teams
    try {
      teams = await getTeams()
      this.getData().teams = teams
    } catch (e) { return this._err(e) }

    this.showLoading('Selecting team...')
    this.showTeamsSelector(teams, {
      onConfirm: team => {
        this.getData().team = team
        this.showMachines(team.slug)
      }
    })
  }

  showMachineSettingsView (machines, options = {}) {
    const { onMount, onAlwaysOnChange, onPowerChange, onShowLogs } = options

    const view = new MachineSettings({ machines })
    const panel = atom.workspace.addBottomPanel({
      className: 'kd-machine-selector',
      item: view,
      visible: true,
      priority: 201
    })

    view.emitter.on('machine-settings:close', () => {
      panel.destroy()
    })

    if (onMount) {
      view.emitter.on('machine-settings:mount', onMount)
    }
    if (onAlwaysOnChange) {
      view.emitter.on('machine-settings:always-on-change', onAlwaysOnChange)
    }
    if (onPowerChange) {
      view.emitter.on('machine-settings:power-change', onPowerChange)
    }
    if (onShowLogs) {
      view.emitter.on('machine-settings:show-logs', onShowLogs)
    }
  }

  async showMachineSettings (team = null) {
    log('show machine settings')
    this.showLoading('Loading machines…')

    let machines
    try {
      machines = await getMachines(team)
      this.getData().machines = machines
    } catch (e) { return this._err(e) }

    this.hideLoading()

    this.showMachineSettingsView(machines, {
      onAlwaysOnChange: this.bound('setAlwaysOn'),
      onPowerChange: this.bound('setPowerState'),
      onShowLogs: this.bound('showBuildLogs'),
      onMount: this.bound('onMount')
    })
  }

  setAlwaysOn ({ machine, state }) {
    log('set always on not implemented yet', { state })
  }

  setPowerState ({ machine, state }) {
    log('set power state not implemented yet', { state })
  }

  showBuildLogs ({ machine }) {
    log('show build logs not implemented yet', { machine })
  }

  onMount ({ machine }) {
    this.getData().machine = machine
    this.showMountPrompt(machine)
  }

  onUnmount ({ machine }) {
    log('unmount machine not implemented yet', { machine })
  }

  showMachinesSelector (machines, options = {}) {
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

    view.emitter.on('machineSelector-cancelled', event => {
      this.machineSelector.hide()
      options.onCancel && options.onCancel()
    })

    view.emitter.on('machineSelector-confirmed', machine => {
      this.machineSelector.hide()
      options.onConfirm && options.onConfirm(machine)
    })
  }

  async showMachines (team) {
    log('showMachines')
    this.showLoading('Loading machines…')

    let machines
    try {
      machines = await getMachines(team)
      this.getData().machines = machines
    } catch (e) { return this._err(e) }

    this.showLoading('Selecting machine...')
    this.showMachinesSelector(machines, {
      onConfirm: machine => {
        this.getData().machine = machine
        this.showMountPrompt(machine)
      }
    })
  }

  runMountCmd (machine, options = {}) {
    const { remote, local, onConfirm, onError } = options

    execa('kd', ['machine', 'mount', remote, local])
      .then(result => {
        onConfirm && onConfirm()
      }).catch(e => {
        onError && onError()
      })
  }

  showMountPrompt (machine) {
    const localBasePath = atom.config.get('kd.localBasePath')
    const localPath = `${localBasePath}/${machine.team}/${machine.label}`
    const remotePath = `/home/${machine.owner || machine.username}`

    this.showLoading('Selecting folders...')
    const panel = this.showPrompt({
      prompts: makePrompts(remotePath, localPath),
      callback: (err, inputs) => {
        panel.destroy()
        if (err) { return }

        const { localPath, remotePath } = inputs
        const remoteAddress = `${machine.id}:${remotePath}`

        this.showLoading('Mounting...')

        this.runMountCmd(machine, {
          remote: remoteAddress,
          local: localPath,
          onConfirm: () => {
            this.hideLoading()
            atom.notifications.addSuccess(getMountedMessage())
            atom.workspace.project.addPath(localPath)
            showTreeView()
          },
          onError: err => {
            this.hideLoading()
            atom.notifications.addError(getMountError(), {
              stack: err.stack
            })
          }
        })
      }
    })
  }

  showMountSelector (mounts, options = {}) {
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
      options.onCancel && options.onCancel()
    })
    view.emitter.on('mountSelector-confirmed', mount => {
      this.mountSelector.hide()
      options.onConfirm && options.onConfirm(mount)
    })
  }

  async showMounts (showMessage = true) {
    log('showMounts')
    if (showMessage) {
      this.showLoading('Loading mounts…')
    }
    let mounts
    try {
      mounts = await getMounts()
      this.getData().mounts = mounts
    } catch (e) { return this._err(e) }

    this.showLoading('Selecting mount…')
    this.showMountSelector(mounts, {
      onConfirm: mount => {
        this.hideLoading()
        this.getData().mount = mount
        atom.workspace.project.addPath(mount.mount.path)
        showTreeView()
      },
      onCancel: () => {
        this.hideLoading()
      }
    })
  }
}

const getMountedMessage = () =>
  `Machine mounted, preparing the mount please wait…`

const getMountError = () => `Machine could not be mounted, rolling back…`

const makePrompts = (remote, local) => (
  [
    {
      name: 'localPath',
      title: 'Local path:',
      defaultValue: local,
      placeholder: local
    },
    {
      name: 'remotePath',
      title: 'Remote path:',
      defaultValue: remote,
      placeholder: remote
    }
  ]
)
