'use babel'
/* globals atom */

import kd from 'kd.js'
import debug from 'debug'
import execa from 'execa'
import KD from './kd-states'
import Sidebar from './views/sidebar'
import KDHelpView from './views/kd-help-view'
import TeamSelector from './views/team-selector'
import MachineSelector from './views/machine-selector'
import MountSelector from './views/mount-selector'
import { doLogin,
         getClientIdFromHeaders,
         setSessionCookie } from './utils'
import getTeams from './utils/get-teams'
import getMachines from './utils/get-machines'
import getMounts from './utils/get-mounts'

const log = debug('controller:log')
const error = debug('app:err')

export default class KodingController extends kd.Object {

  constructor (serializedState = {}) {
    super({}, serializedState)
    let clientId = this.getData().sessionCookie
    if (clientId) {
      this.setSession(clientId)
    }

    /* this timeout is for some reason necessary
       otherwise we get an ENOENT error */
    setTimeout(() => {
      let activeDirs = atom.workspace.project.getDirectories()
      if (activeDirs.length) {
        log('project is present, run in background')
      } else {
        KD.checkers.isLoggedIn.fn().then(result => {
          return getTeams().then(teams => {
            let data = this.getData()
            data.teams = teams
            this.showTeams()
          })
        }).catch(err => {
          error(err)
          this.showKDHelp()
        })
      }
    }, 1000)
  }

  destroy () {
    // allow GC to clean kd.js allocated memory
    this.sidebar.destroy()
    KD.init()
  }

  getElement () {
    return this.sidebar.getElement()
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
        this.getData().team = team
        this.teamSelector.hide()
        getMachines(team.slug).then(machines => {
          this.getData().machines = machines
          this.showMachines()
        })
      })
    } else {
      this.teamSelector.show()
    }
  }

  async showMounts () {
    log('showMounts')
    let mounts = await getMounts()
    this.getData().mounts = mounts

    if (!this.mountSelector) {
      let view = new MountSelector(this.getData().mounts)
      this.mountSelector = atom.workspace.addModalPanel({
        className: 'koding-mount-selector',
        item: view,
        visible: true,
        priority: 201
      })
      view.emitter.on('mountSelector-cancelled', event => { this.mountSelector.hide() })
      view.emitter.on('mountSelector-confirmed', mount => {
        this.getData().mount = mount
        this.mountSelector.hide()
        atom.workspace.project.addPath(mount.Mount.path)
      })
    } else {
      this.mountSelector.show()
    }
  }

  showMachines () {
    log('showMachines')
    if (!this.machineSelector) {
      let view = new MachineSelector(this.getData().machines)
      this.machineSelector = atom.workspace.addModalPanel({
        className: 'koding-machine-selector',
        item: view,
        visible: true,
        priority: 201
      })
      view.emitter.on('machineSelector-cancelled', event => { this.machineSelector.hide() })
      view.emitter.on('machineSelector-confirmed', machine => {
        this.getData().machine = machine
        this.machineSelector.hide()
        execa('kd', ['machine', 'mount', machine.id, `~/koding/${machine.label}`]).then(result => {
          log(result)
        }).catch(e => {
          error(e)
        })
      })
    } else {
      this.machineSelector.show()
    }
  }

  showKDHelp (prompt) {
    log('showKDHelp')
    if (!this.kdHelpView) {
      let view = new KDHelpView({ prompt })
      this.kdHelpView = atom.workspace.addModalPanel({
        className: 'koding-login-view',
        item: view,
        visible: true,
        priority: 200
      })
      view.emitter.on('kd-is-in-good-shape', event => { this.kdHelpView.hide() })
      view.emitter.on('modal-cancelled', event => { this.kdHelpView.hide() })
      view.emitter.on('modal-submitted', this.doLogin.bind(this))
    } else {
      this.kdHelpView.show()
    }
  }

  showSidebar () {
    log('showSidebar')
    if (!this.sidebar) {
      let { team, account, machines } = this.getData()
      let view = new Sidebar({ team, account, machines })
      this.sidebar = atom.workspace.addLeftPanel({
        item: view,
        visible: true,
        priority: 1
      })
      view.emitter.on('logout-clicked', e => { this.emit('logout-clicked') })
      view.emitter.on('print-clicked', e => { log(this.getData()) })
      view.emitter.on('machines-fetched', machines => { this.getData().machines = machines })
    } else {
      this.sidebar.show()
    }
  }

  setSession (clientId) {
    this.data.sessionCookie = clientId
    setSessionCookie(clientId)
  }

  reset () {
    this.setData({
      // to persist the username in the login form
      username: this.getData().username
    })
    this.sidebar.destroy()
    this.sidebar = null
  }

  async doLogin ({username, password}) {
    log('doLogin', username, password)
    doLogin(username, password).then((result) => {
      atom.notifications.addSuccess('Successfully logged in!')
      let clientId = getClientIdFromHeaders(result.headers['set-cookie'])
      this.data.username = username
      this.kdHelpView.destroy()
      this.kdHelpView = null
      this.setSession(clientId)
      this.checkTeams()
    }).catch(e => {
      atom.notifications.addError(e.error, { description: e.message })
    })
  }
}

// async checkTeams () {
//   let account = await apiCall('JUser.whoami')
//   let teams = await apiCall(`JAccount.fetchGroups/${account.data._id}`)

//   let data = this.getData()
//   data.account = account.data
//   data.teams = teams.data

//   this.showTeams()
// }
