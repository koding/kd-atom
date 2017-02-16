'use babel'
/* globals atom */

import KodingController from './koding-controller'
import { CompositeDisposable } from 'atom'
import { isLoggedIn } from './utils'

export default {

  kodingController: null,
  loggedIn: null,

  activate (state) {
    console.log('koding activated!')
    this.subscriptions = new CompositeDisposable()
    this.kodingController = new KodingController({}, state)
    this.init()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'koding:init': () => this.init(),
      'koding:kill': () => this.kill(),
      'koding:toggle': () => this.toggle()
    }))
  },

  deactivate () {
    this.subscriptions.dispose()
    this.kodingView.destroy()
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
