'use babel'
/* globals atom */

import kd from 'kd.js'
import debug from 'debug'
import KD from './kd-states'
import PromptView from './views/prompt-view'
import TeamSelector from './views/team-selector'
import MachineSettings from './views/machine-settings'
import MountSettings from './views/mount-settings'
import getTeams from './utils/get-teams'
import getMachines from './utils/get-machines'
import getMounts from './utils/get-mounts'
import showTreeView from './utils/show-tree-view'
import StatusBarIcon from './views/statusbar-icon'
import kdRun from './utils/kd-run'
import setMountIcons from './utils/set-mount-icons'

const log = debug('kd-controller:log')
const error = debug('kd:err')

export default class KDController extends kd.Object {
  constructor (serializedState = {}) {
    super({}, serializedState)
    KD.init()

    this.machinePanel = null
    this.mountPanel = null
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

    this.showLoading('Selecting team…')
    this.showTeamsSelector(teams, {
      onConfirm: team => {
        this.getData().team = team
        this.showMachines(team.slug)
      },
      onCancel: this.bound('hideLoading')
    })
  }

  destroyPanel (type) {
    const panel = this[`${type}Panel`]

    panel && panel.destroy()

    this[`${type}Panel`] = null
  }

  showMachineSettingsView (machines, options = {}) {
    const {
      filterValue,
      onMount,
      onAlwaysOnChange,
      onPowerChange,
    } = options

    const view = new MachineSettings({ machines, filterValue })

    this.destroyPanel('machine')

    this.machinePanel = atom.workspace.addBottomPanel({
      className: 'kd-machine-selector',
      item: view,
      visible: true,
      priority: 201
    })

    view.emitter.on('machine-settings:close', () => {
      this.destroyPanel('machine')
    })

    view.emitter.on('machine-settings:open-terminal', ({ machine }) => {
      this.openTerminal({ machine })
    })

    view.emitter.on('machine-settings:reload', () => {
      this.showMachines(null, true)
      this.destroyPanel('machine')
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
  }

  async showMachines (team = null, reload = false, filterValue = '') {
    log('show machine settings')
    this.showLoading('Loading machines…')

    let machines = this.getData().machines
    if (!machines || reload) {
      try {
        machines = await getMachines(team)
        this.getData().machines = machines
      } catch (e) { return this._err(e) }
    }

    this.hideLoading()

    this.showMachineSettingsView(machines, {
      filterValue,
      onAlwaysOnChange: this.bound('setAlwaysOn'),
      onPowerChange: this.bound('setPowerState'),
      onMount: this.bound('onMount'),
      onCancel: this.bound('hideLoading')
    })
  }

  setAlwaysOn ({ machine, state }) {
    log('set always on not implemented yet', { state })
  }

  setPowerState ({ machine, state }) {
    const cmd = state ? 'start' : 'stop'

    this.showLoading(`${state ? 'Starting' : 'Stopping'} machine…`)

    return kdRun(`machine ${cmd} ${machine.alias}`)
      .then(() => {
        this.hideLoading()
        this.showMachines(null, true)
        this.destroyPanel('machine')
      })
      .catch(err => {
        this.hideLoading()
        atom.notifications.addError(err.message, {
          stack: err.stack ? err.stack : null
        })
      })
  }

  onMount ({ machine }) {
    this.getData().machine = machine
    this.showMountPrompt(machine)
  }

  openTerminal ({ machine }) {
    // implement initial command based on machine
    let activeEditor = atom.views.getView(
      atom.workspace.getActiveTextEditor()
    )
    atom.commands.dispatch(activeEditor, 'atom-terminal:open')
  }

  runMountCmd (machine, options = {}) {
    const { remote, local, onConfirm, onError } = options

    kdRun(['machine', 'mount', remote, local])
      .then(result => {
        onConfirm && onConfirm()
      }).catch(e => {
        onError && onError(e)
      })
  }

  showMountPrompt (machine) {
    const localBasePath = atom.config.get('kd.localBasePath')
    const localPath = `${localBasePath}/${machine.team}/${machine.label}`
    const remotePath = `/home/${machine.owner || machine.username}`

    this.showLoading('Selecting folders…')
    const panel = this.showPrompt({
      prompts: makePrompts(remotePath, localPath),
      callback: (err, inputs) => {
        panel.destroy()
        this.hideLoading()

        if (err) { return }

        const { localPath, remotePath } = inputs
        const remoteAddress = `${machine.id}:${remotePath}`

        this.showLoading('Mounting…')

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

  showMountSettingsView (mounts, machines, options = {}) {
    this.destroyPanel('mount')
    this.mountPanel = atom.workspace.addBottomPanel({
      className: 'kd-machine-selector',
      item: new MountSettings({
        mounts,
        machines,
        options: {
          ...options,
          onClose: () => this.destroyPanel('mount')
        }
      }),
      visible: true,
      priority: 201
    })
  }

  async showMounts () {
    log('show mounts settings')
    this.showLoading('Loading mounts…')

    let mounts, machines
    try {
      mounts = await getMounts()
      machines = await getMachines()
      this.getData().mounts = mounts
      this.getData().machines = machines
      setMountIcons(mounts)
    } catch (e) { return this._err(e) }

    this.hideLoading()

    const { workspace, notifications } = atom

    this.showMountSettingsView(mounts, machines, {
      onClose: () => {
        this.hideLoading()
        this.destroyPanel('mount')
      },
      onReload: () => {
        this.showMounts()
        this.destroyPanel('mount')
      },
      onShowMachine: ({ machine }) => {
        log('on show machine', machine)
        this.hideLoading()
        this.destroyPanel('mount')
        this.showMachines(null, false, machine.alias)
      },
      onOpen: ({ mount }) => {
        log('on open mount', mount)
        this.getData().mount = mount
        workspace.project.addPath(mount.mount.path)
        showTreeView()
        setMountIcons(mounts)
      },
      onNewWindow: ({ mount }) => {
        log('on open mount in new window', mount)
        atom.open({ pathsToOpen: mount.mount.path, newWindow: true })
      },
      onUnmount: ({ mount }) => {
        log('on unmount', mount)
        this.showLoading('Unmounting…')
        kdRun(['umount', mount.id])
          .then(() => {
            this.hideLoading()
            notifications.addSuccess(`${mount.label} unmounted successfully`)
            this.destroyPanel('mount')
          })
          .catch(err => {
            this.hideLoading()
            notifications.addError(
              `Error while trying to unmount ${mount.label}`,
              { stack: err.stack }
            )
          })
      }
    })
  }

  consumeStatusBar (statusBar) {
    this.statusBarItem = new StatusBarIcon({
      callback: (method) => { this[method] && this[method]() }
    })
    this.statusBarTile = statusBar.addRightTile({
      item: this.statusBarItem,
      priority: 100
    })
  }

  destroy () {
    this.statusBarTile.destroy()
    this.statusBarItem.destroy()
    this.statusBarTile = null
    this.statusBarItem = null

    this.destroyPanel('machine')
    this.destroyPanel('mount')

    super.destroy()
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
