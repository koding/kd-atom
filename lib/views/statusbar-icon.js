'use babel'
/* globals atom */

import { View } from 'atom-space-pen-views'
import { Icons } from '../../assets/svgs'
import KDHelpView from './kd-help-view'
import KD from '../kd-states'

let lastPrompt, wasSticky

export default class StatusBarIcon extends View {

  static content () {
    this.div({
      class: 'inline-block kd-statusbar-icon loading'
    }, () => {
      this.raw(Icons.statusBar)
      this.span({
        outlet: 'message',
        class: 'inline-block loading-message'
      }, 'Initializing…')
    })
  }

  attached (event) {
    this.succeeded = []
    /* to give statusbar sometime to put other
       tiles installed by other packages */
    setTimeout(() => { this.init() }, 1000)
  }

  init () {
    this.setTooltip(null, true)

    KD.emitter.on('kd-state', prompt => {
      if (prompt === 'ALL_GOOD') {
        setTimeout(() => {
          this.setTooltip(prompt)
        }, 2000)
        this.element.classList.add('good')
        this.element.classList.remove('loading')
        this.setLoadingMessage()
      } else {
        this.setTooltip(prompt, true)
        this.element.classList.remove('good')
      }
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
      this.succeeded.push(prompt)
      this.setTooltip(null, true, true)
    })
  }

  setLoadingMessage (message = '') {
    this.message.html(message)
  }

  setTooltip (prompt, sticky, force) {
    if (!force && prompt === lastPrompt && sticky === wasSticky) {
      return
    }

    if (this.disposable) {
      this.clearDisposable()
    }

    let item = new KDHelpView({
      prompt: prompt,
      mini: true,
      succeeded: this.succeeded
    })
    let trigger = sticky ? 'manual' : 'click'

    this.disposable = atom.tooltips.add(this, {
      title: 'This is a tooltip',
      trigger: trigger,
      class: 'kd-statusbar-tooltip',
      item: item
    })

    lastPrompt = prompt
    wasSticky = sticky
  }

  detached () {
    this.clearDisposable()
  }

  clearDisposable () {
    this.disposable.dispose()
    this.disposable = null
  }

}
