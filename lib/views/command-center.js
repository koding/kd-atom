'use babel'
/* globals atom */

import debug from 'debug'
import { Emitter } from 'atom'
import { View } from 'atom-space-pen-views'
import getKeybinding from '../utils/get-keybinding'

const log = debug('command-center:log')

export default class CommandCenterView extends View {

  static content (data = {}) {
    this.div({ class: 'command-center' }, () => {
      this.div({ outlet: 'content' }, () => {
        this.h2(() => {
          this.code('kd')
          this.text('is up & running')
          this.span({
            class: 'icon icon-x x pull-right',
            click: 'close'
          })
        })

        this.div({
          class: 'icon icon-check'
        }, `The daemon is running.`)
        this.div({
          class: 'icon icon-check'
        }, `You're logged in!`)

        this.div({ class: 'buttons' }, () => {
          this.button({
            click: 'show',
            class: 'btn btn-sm btn-info icon icon-server' }
          , 'Machines')
          this.button({
            click: 'show',
            class: 'btn btn-sm icon icon-organization' }
          , 'Teams')
          this.button({
            click: 'show',
            class: 'btn btn-sm icon icon-desktop-download' }
          , 'Mounts')
        })

        this.div({
          class: 'alert text icon icon-question',
          outlet: 'infobox'
        }, () => {
          this.raw(`Now you can open the command palette
                   (<code>!!!!</code>) and type <code>kd</code>
                   to see the available commands.`)
        })
      })
    })
  }

  initialize () {
    this.emitter = new Emitter()
    setTimeout(() => {
      let binding = getKeybinding('command-palette:toggle')
      this.infobox.html(this.infobox.html().replace('!!!!', binding))
    }, 1000)
  }

  close (event) {
    this.emitter.emit('help-view-close-clicked')
  }

  show (event) {
    log(arguments)
    this.close()
    let target = event.target.innerHTML
    let { kdController } = atom.packages.getActivePackage('kd').mainModule
    kdController[`show${target}`]()
  }

}
