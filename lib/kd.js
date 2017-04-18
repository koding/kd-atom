'use babel'
/* globals atom */

import { CompositeDisposable } from 'atom'
import debug from 'debug'
import KD from './kd-states'
import KDController from './kd-controller'
import StatusBarIcon from './views/statusbar-icon'
import checkAtomDeps from './utils/check-atom-deps'
import StorageController from './controllers/storage-controller'

const log = debug('kd:log')
const error = debug('kd:err')

export default {

  kdController: null,

  config: {
    localBasePath: {
      type: 'string',
      description: 'Local base path for mounting machines',
      default: `${require('os').homedir()}/koding`
    }
  },

  activate (state) {
    log('kd activated!', state)
    this.subscriptions = new CompositeDisposable()
    this.storage = StorageController.make('KDController')

    this.storage.deserialize(state).then(data => {
      this.kdController = new KDController(data)
    }).catch(err => error('can not deserialize', err))

    KD.emitter.on('ready', this.bindEvents.bind(this))

    checkAtomDeps()
  },

  bindEvents () {
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'kd:teams': () => { this.teamSelector() },
      'kd:machines': () => { this.kdController.showMachines() },
      'kd:mounts': () => { this.kdController.showMounts() },
      'kd:terminal': () => {
        let activeEditor = atom.views.getView(
          atom.workspace.getActiveTextEditor()
        )
        atom.commands.dispatch(activeEditor, 'atom-terminal:open')
      },
      'kd:dashboard': () => { this.statusBarItem.trigger('click') }
    }))
  },

  serialize () {
    return this.storage.serialize(this.kdController.getData())
  },

  deactivate () {
    this.subscriptions.dispose()
    this.statusBarTile.destroy()
    this.statusBarItem.destroy()
    this.statusBarTile = null
    this.statusBarItem = null
  },

  teamSelector () {
    this.kdController.showTeams()
  },

  resetStorage () {
    this.storage.reset()
    this.kdController.reset()
    this.login()
  },

  consumeStatusBar (statusBar) {
    this.statusBarRegistry = statusBar
    this.statusBarItem = new StatusBarIcon()
    this.statusBarTile = statusBar.addRightTile({
      item: this.statusBarItem,
      priority: 100
    })
  }

}
