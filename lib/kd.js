'use babel'
/* globals atom */

import { CompositeDisposable } from 'atom'
import storage from 'electron-json-storage'
import debug from 'debug'
import KD from './kd-states'
import KodingController from './koding-controller'
import StatusBarIcon from './views/statusbar-icon'

const log = debug('app:log')
const error = debug('app:err')

export default {

  kodingController: null,
  loggedIn: null,

  activate (state) {
    log('koding activated!', state)
    this.subscriptions = new CompositeDisposable()
    if (state.data) {
      this.kodingController = this.deserialize(state)
    } else {
      storage.get('koding-serializer', (err, state) => {
        if (err) {
          error('error getting state from storage', err)
        }
        log('getting state from storage', state.data)
        this.kodingController = new KodingController(state.data)
      })
    }
    KD.emitter.on('ready', this.bindEvents.bind(this))
  },

  bindEvents () {
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'koding:login': () => { this.login() },
      'koding:logout': () => { this.resetStorage() },
      'koding:teams': () => { this.teamSelector() },
      'koding:machines': () => { this.kodingController.showMachines() },
      'koding:mounts': () => { this.kodingController.showMounts() }
    }))
  },

  serialize () {
    log('serializing')
    let data = {
      deserializer: 'KodingController',
      data: this.kodingController.getData()
    }
    storage.set('koding-serializer', data)
    return data
  },

  deserialize ({data}) {
    log('deserialize', data)
    return new KodingController(data)
  },

  deactivate () {
    this.subscriptions.dispose()
    this.statusBarTile.destroy()
    this.statusBarItem.destroy()
    this.statusBarTile = null
    this.statusBarItem = null
  },

  login () {
    this.kodingController.showLogin()
  },

  teamSelector () {
    this.kodingController.showTeams()
  },

  resetStorage () {
    let data = {
      deserializer: 'KodingController',
      data: {}
    }
    storage.set('koding-serializer', data)
    log('storage cleared!')
    this.kodingController.reset()
    this.login()
  },

  consumeStatusBar (statusBar) {
    this.statusBarRegistry = statusBar
    this.statusBarItem = new StatusBarIcon()
    this.statusBarTile = statusBar.addRightTile({ item: this.statusBarItem, priority: 100 })
  }

}
