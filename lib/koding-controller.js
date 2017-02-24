'use babel'
/* globals atom */

import kd from 'kd.js'
import debug from 'debug'
import Sidebar from './views/sidebar'
import LoginView from './views/login-view'
import TeamSelector from './views/team-selector'
import { apiCall, doLogin, isLoggedIn,
         getClientIdFromHeaders,
         setSessionCookie } from './utils'

const log = debug('controller:log')
const error = debug('app:err')

export default class KodingController extends kd.Object {

  constructor (serializedState = {}) {
    super({}, serializedState)
    log(serializedState, this.getData())
    let clientId = this.getData().sessionCookie
    if (clientId) {
      this.setSession(clientId)
    }

    isLoggedIn().then(res => {
      if (this.getData().team) {
        this.showSidebar()
      } else {
        this.checkTeams()
      }
    }).catch(err => {
      error(err)
      this.showLogin()
    })
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

    let data = this.getData()
    data.account = account
    data.teams = teams.data

    this.showTeams()
  }

  showTeams () {
    log('showTeams')
    if (!this.teamSelector) {
      let view = new TeamSelector(this.getData().teams)
      this.teamSelector = atom.workspace.addModalPanel({
        className: 'koding-team-selector',
        item: view,
        visible: true,
        priority: 201
      })
      view.emitter.on('teamSelector-cancelled', event => { this.teamSelector.hide() })
      view.emitter.on('teamSelector-confirmed', team => {
        if (this.getData().team) {
          this.sidebar.destroy()
          this.sidebar = null
        }
        this.getData().team = team
        this.teamSelector.hide()
        this.showSidebar()
      })
    } else {
      this.teamSelector.show()
    }
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
