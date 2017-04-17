'use babel'
/* globals atom */

import { View } from 'atom-space-pen-views'

export default class CommandCenterView extends View {

  static content (data = {}) {
    this.div(() => {
      this.div({ outlet: 'content' }, () => {
        this.h2(() => {
          this.code('kd')
          this.text('is up & running')
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

  // close () {
  //   let { statusBarItem } = atom.packages.getActivePackage('kd').mainModule
  //   statusBarItem.clearDisposable()
  // }

  show (event) {
    console.log(arguments)
    let target = event.target.innerHTML
    let { kdController } = atom.packages.getActivePackage('kd').mainModule
    kdController[`show${target}`]()
    // this.close()
  }

}
