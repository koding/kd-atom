'use babel'
/* globals atom */

import KodingController from './koding-controller'
import { CompositeDisposable } from 'atom'
import { isLoggedIn } from './utils'
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
      this.init()
    } else {
      storage.get('koding-serializer', (err, state) => {
        if (err) {
          error('error getting state from storage', err)
        }
        log('getting state from storage', state.data)
        this.kodingController = new KodingController(state.data)
        this.init()
      })
    }
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'koding:init': () => this.init(),
      'koding:kill': () => this.kill(),
      'koding:toggle': () => this.toggle()
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

  async init () {
    await isLoggedIn().then(res => {
      console.log(res)
      this.loggedIn = true
      this.kodingController.checkTeams()
    }).catch(err => {
      console.log(err)
      this.loggedIn = false
      this.kodingController.showLogin()
    })

    return this.loggedIn
  }

}
