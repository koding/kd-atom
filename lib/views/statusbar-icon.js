'use babel'
/* globals atom */

import debug from 'debug'
import { View } from 'atom-space-pen-views'
import { Icons } from '../../assets/svgs'
import KDHelpView from './kd-help-view'
import CommandCenterView from './command-center'
import KD from '../kd-states'

const log = debug('statusbar:log')

const success = {
  NOT_INSTALLED: 'kd installed…',
  NOT_LOGGEDIN: 'Logged in…',
  DAEMON_NOT_INSTALLED: 'daemon is installed',
  DAEMON_STOPPED: 'daemon is running',
}

let lastPrompt, wasSticky

export default class StatusBarIcon extends View {
  static content() {
    this.div(
      {
        class: 'inline-block kd-statusbar-icon loading',
        click: 'click',
      },
      () => {
        this.raw(Icons.statusBar)
        this.span(
          {
            outlet: 'message',
            class: 'inline-block loading-message',
          },
          'Initializing…'
        )
      }
    )
  }

  initialize({ callback }) {
    this.callback = callback
  }

  attached(event) {
    /* to give statusbar sometime to put other
       tiles installed by other packages */
    setTimeout(() => {
      this.init()
    }, 1000)
  }

  init() {
    KD.emitter.on('kd-state-all-good', () => {
      setTimeout(() => {
        this.setTooltip('command-center')
        this.setLoadingMessage()
        this.element.classList.remove('loading')
      }, 2000)
      this.element.classList.add('good')
    })

    KD.emitter.on('kd-state', prompt => {
      this.element.classList.remove('good')
      this.element.classList.remove('loading')
      this.setTooltip(prompt, true)
      this.setLoadingMessage()
    })

    KD.emitter.on('kd-state-loading', message => {
      this.element.classList.add('loading')
      this.setLoadingMessage(message)
    })

    KD.emitter.on('kd-state-loading-finished', () => {
      this.element.classList.remove('loading')
      this.setLoadingMessage()
    })

    KD.emitter.on('kd-state-success', prompt => {
      this.setLoadingMessage(success[prompt])
    })
  }

  setLoadingMessage(message = '') {
    this.message.html(message)
  }

  setTooltip(prompt, sticky, force) {
    if (!force && prompt === lastPrompt && sticky === wasSticky) {
      return
    }

    if (this.disposable) {
      this.clearDisposable()
    }

    let item = this.getItem(prompt)
    let trigger = sticky ? 'manual' : 'click'

    this.disposable = atom.tooltips.add(this, {
      trigger: trigger,
      class: 'kd-statusbar-tooltip',
      item: item,
    })

    lastPrompt = prompt
    wasSticky = sticky
  }

  click() {
    if (this.disposable) {
      return
    }
    this.setTooltip(lastPrompt, wasSticky, true)
  }

  getItem(prompt) {
    let item
    if (prompt === 'command-center') {
      log('command-center opened')
      item = new CommandCenterView()
      item.emitter.on('command-center:button-clicked', target => {
        this.callback(`show${target}`)
      })
    } else {
      log('help-view opened')
      item = new KDHelpView({
        prompt: prompt,
        mini: true,
      })
    }
    item.emitter.on('help-view-close-clicked', () => {
      this.clearDisposable()
    })
    return item
  }

  detached() {
    this.clearDisposable()
  }

  clearDisposable() {
    this.disposable.dispose()
    this.disposable = null
  }
}
