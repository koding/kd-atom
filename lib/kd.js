'use babel'
/* globals atom */

import { CompositeDisposable } from 'atom'
import storage from 'electron-json-storage'
import debug from 'debug'
import electron from 'electron'
import KD from './kd-states'
import KDController from './kd-controller'
import StatusBarIcon from './views/statusbar-icon'
import { install as atomPackageDepsInstall } from 'atom-package-deps'

const log = debug('kd:log')
const error = debug('kd:err')
const { remote } = electron

export default {

  kdController: null,

  activate (state) {
    log('kd activated!', state)
    this.subscriptions = new CompositeDisposable()

    if (state.data) {
      this.kdController = this.deserialize(state)
    } else {
      storage.get('kd-serializer', (err, state) => {
        if (err) {
          error('error getting state from storage', err)
        }
        log('getting state from storage', state.data)
        this.kdController = new KDController(state.data)
      })
    }
    KD.emitter.on('ready', this.bindEvents.bind(this))

    // Workaround for restoring multiple Atom windows. This prevents having all
    // the windows trying to install the deps at the same time - often clobbering
    // each other's install.
    const firstWindowId = remote.BrowserWindow.getAllWindows()[0].id
    const currentWindowId = remote.getCurrentWindow().id
    if (firstWindowId === currentWindowId) {
      atomPackageDepsInstall('kd')
    }
  },

  bindEvents () {
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'kd:teams': () => { this.teamSelector() },
      'kd:machines': () => { this.kdController.showMachines() },
      'kd:mounts': () => { this.kdController.showMounts() },
      'kd:terminal': () => {
        let activeEditor = atom.views.getView(atom.workspace.getActiveTextEditor())
        atom.commands.dispatch(activeEditor, 'atom-terminal:open')
      }
    }))
  },

  serialize () {
    log('serializing')
    let data = {
      deserializer: 'KDController',
      data: this.kdController.getData()
    }
    storage.set('kd-serializer', data)
    return data
  },

  deserialize ({data}) {
    log('deserialize', data)
    return new KDController(data)
  },

  deactivate () {
    this.subscriptions.dispose()
    this.statusBarTile.destroy()
    this.statusBarItem.destroy()
    this.statusBarTile = null
    this.statusBarItem = null
  },

  teamSelector () {
    this.kdController.showTeams()
  },

  resetStorage () {
    let data = {
      deserializer: 'KDController',
      data: {}
    }
    storage.set('kd-serializer', data)
    log('storage cleared!')
    this.kdController.reset()
    this.login()
  },

  consumeStatusBar (statusBar) {
    this.statusBarRegistry = statusBar
    this.statusBarItem = new StatusBarIcon()
    this.statusBarTile = statusBar.addRightTile({ item: this.statusBarItem, priority: 100 })
  }

}
