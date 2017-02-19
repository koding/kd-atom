'use babel'
/* globals atom */

import KodingController from './koding-controller'
import { CompositeDisposable } from 'atom'
import { isLoggedIn } from './utils'

export default {

  kodingController: null,
  loggedIn: null,

  activate (state) {
    console.log('koding activated!', state)
    this.subscriptions = new CompositeDisposable()
    if (state.data) {
      this.kodingController = this.deserialize(state)
      this.init()
    } else {
        this.kodingController = new KodingController(state.data)
    }
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'koding:init': () => this.init(),
      'koding:kill': () => this.kill(),
      'koding:toggle': () => this.toggle()
    }))
  },

  serialize () {
    console.log('serializing')
    let data = {
      deserializer: 'KodingController',
      data: this.kodingController.getData()
    }
    return data
  },
  deserialize ({data}) {
    console.log('deserialize', data)
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
