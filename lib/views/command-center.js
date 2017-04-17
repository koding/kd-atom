'use babel'
/* globals atom */

import debug from 'debug'
import { Emitter } from 'atom'
import { View } from 'atom-space-pen-views'

const log = debug('command-center:log')

export default class CommandCenterView extends View {

  static content (data = {}) {
    this.div(() => {
      this.div({ outlet: 'content' }, () => {
        this.h2(() => {
          this.code('kd')
          this.text('is up & running')
          this.span({
            class: 'icon icon-x x pull-right',
            click: 'close'
          })
        })
        this.p(() => {
          this.text(`The daemon is running. You're logged in!`)
          this.raw('<br><br>')
          this.raw(`Now you can open the command palette
                   (<code>!!!!</code>) and type <code>kd</code>
                   to see the available commands.`)
        })
        this.button({ click: 'show', class: 'btn' }, 'Machines')
        this.button({ click: 'show', class: 'btn' }, 'Teams')
        this.button({ click: 'show', class: 'btn' }, 'Mounts')
      })
    })
  }

  initialize () {
    this.emitter = new Emitter()
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
