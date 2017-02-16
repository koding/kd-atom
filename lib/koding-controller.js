'use babel'
/* globals atom */

import kd from 'kd.js'
import Sidebar from './views/sidebar'
import LoginView from './views/login-view'
import { apiCall } from './utils'

export default class KodingController extends kd.Object {

  constructor (serializedState) {
    super({}, serializedState)
  }

  destroy () {
    // allow GC to clean kd.js allocated memory
    this.sidebar.destroy()
  }

  getElement () {
    return this.sidebar.getElement()
  }

  async checkTeams () {
    console.log('checkTeams')
    let account = await apiCall('JUser.whoami')
    let teams = await apiCall(`JAccount.fetchGroups/${account.data._id}`)

    console.log(account.data._id, teams)
  }

  showLogin () {
    console.log('showLogin')

    if (!this.loginView) {
      let view = new LoginView()
      this.loginView = atom.workspace.addModalPanel({
        className: 'koding-login-view',
        item: view,
        visible: true,
        priority: 200
      })
      view.emitter.on('modal-cancelled', event => { this.loginView.hide() })
      view.emitter.on('modal-submitted', this.doLogin.bind(this))
    } else {
      this.loginView.show()
    }
  }

  showSidebar () {
    console.log('showSidebar')
    let view = new Sidebar({ appended: true })
    if (!this.sidebar) {
      this.sidebar = atom.workspace.addLeftPanel({
        item: view.getElement(),
        visible: true,
        priority: 1
      })
    } else {
      this.sidebar.show()
    }
  }

  async doLogin () {
    console.log('doLogin', this)
  }

}
