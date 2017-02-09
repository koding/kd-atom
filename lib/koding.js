'use babel'

import KodingView from './koding-view'
import { CompositeDisposable } from 'atom'
import { isLoggedIn, apiCall } from './utils'

export default {

  subscriptions: null,
  kodingView: null,
  loggedIn: null,

  activate (state) {
    console.log('koding activated!')
    this.subscriptions = new CompositeDisposable()

    console.log({state})
    this.kodingView = new KodingView({ count: 0 })

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
      this.loggedIn = true
      this.checkTeams()
    }).catch(err => {
      console.log(err)
      this.loggedIn = false
      this.showLogin()
    })

    return this.loggedIn
  },

  kill () {
    console.log('kill')
    this.deactivate()
  },

  toggle () {
    return console.log('toggle')
  },

  async checkTeams () {
    console.log('checkTeams')
    let account = await apiCall('JUser.whoami')
    let teams = await apiCall(`JAccount.fetchGroups/${account.data._id}`)

    console.log(account.data._id, teams)
    // JUser.whoami
    // JAccount.fetchGroups
  },

  showLogin () {
    console.log('showLogin')
  }

}
