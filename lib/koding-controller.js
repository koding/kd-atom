'use babel'
/* globals atom */

import kd from 'kd.js'
import debug from 'debug'
import Sidebar from './views/sidebar'
import LoginView from './views/login-view'
import { apiCall, doLogin, isLoggedIn,
         getClientIdFromHeaders,
         setSessionCookie } from './utils'

const log = debug('controller:log')
const error = debug('app:err')

export default class KodingController extends kd.Object {

  constructor (serializedState = {}) {
    super({}, serializedState)
    log(serializedState, this.getData())
  }

  destroy () {
    // allow GC to clean kd.js allocated memory
    this.sidebar.destroy()
  }

  getElement () {
    return this.sidebar.getElement()
  }

  async checkTeams () {
    let account = await apiCall('JUser.whoami')
    let teams = await apiCall(`JAccount.fetchGroups/${account.data._id}`)

  }

  showLogin () {

    log('showLogin')
    if (!this.loginView) {
      let { username, password } = this.getData()
      let view = new LoginView({ username, password })
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
    log('showSidebar')
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

  setSession (clientId) {
    this.data.sessionCookie = clientId
    setSessionCookie(clientId)
  }

  async doLogin ({username, password}) {
    log('doLogin', username, password)
    doLogin(username, password).then((result) => {
      atom.notifications.addSuccess('Successfully logged in!')
      let clientId = getClientIdFromHeaders(result.headers['set-cookie'])
      // remove these two later
      this.data.username = username
      this.data.password = password
      this.loginView.destroy()
      this.setSession(clientId)
      this.checkTeams()
    }).catch(e => {
      atom.notifications.addError(e.error, { description: e.message })
    })
    // log(result)
  }
}
