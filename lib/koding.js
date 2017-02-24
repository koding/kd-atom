'use babel'
/* globals atom */

import { CompositeDisposable } from 'atom'
import storage from 'electron-json-storage'
import debug from 'debug'
import KodingController from './koding-controller'

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
      this.bindEvents()
    } else {
      storage.get('koding-serializer', (err, state) => {
        if (err) {
          error('error getting state from storage', err)
        }
        log('getting state from storage', state.data)
        this.kodingController = new KodingController(state.data)
        this.bindEvents()
      })
    }
  },

  bindEvents () {
    this.kodingController.on('logout-clicked', e => { this.resetStorage() })

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'koding:login': () => this.login(),
      'koding:logout': () => this.resetStorage(),
      'koding:teams': () => this.teamSelector()
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
  }

}
