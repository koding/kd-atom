'use babel'

import debug from 'debug'
import { Emitter } from 'atom'
import { View } from 'atom-space-pen-views'
import getKeybinding from '../utils/get-keybinding'

const log = debug('command-center:log')

export default class CommandCenterView extends View {
  static content(data = {}) {
    this.div({ class: 'command-center' }, () => {
      this.div({ outlet: 'content' }, () => {
        this.h2(() => {
          this.code('kd')
          this.text('is up & running')
          this.span({
            class: 'icon icon-x x pull-right',
            click: 'close',
          })
        })

        this.div(
          {
            class: 'icon icon-check',
          },
          `The daemon is running.`
        )
        this.div(
          {
            class: 'icon icon-check',
          },
          `You're logged in!`
        )

        this.div({ class: 'buttons' }, () => {
          this.button(
            {
              click: 'handleButton',
              'data-target': 'showMachines',
              class: 'btn btn-sm btn-info icon icon-server',
            },
            'Machines'
          )
          this.button(
            {
              click: 'handleButton',
              'data-target': 'showTeams',
              class: 'btn btn-sm icon icon-organization',
            },
            'Teams'
          )
          this.button(
            {
              click: 'handleButton',
              'data-target': 'showMounts',
              class: 'btn btn-sm icon icon-mirror',
            },
            'Mounts'
          )
          this.a(
            {
              href: 'https://github.com/koding/kd-atom/issues/new' +
                '?labels[]=[Type]%20Bug&title=Bug:' +
                '&body=Steps%20to%20reproduce:',
              class: 'btn btn-sm icon icon-bug',
            },
            'Report an issue…'
          )
        })

        this.div(
          {
            class: 'alert text icon icon-question',
            outlet: 'infobox',
          },
          () => {
            this.raw(
              `Now you can open the command palette
                   (<code>!!!!</code>) and type <code>kd</code>
                   to see the available commands.`
            )
          }
        )
      })
    })
  }

  initialize() {
    this.emitter = new Emitter()
    setTimeout(() => {
      let binding = getKeybinding('command-palette:toggle')
      this.infobox.html(this.infobox.html().replace('!!!!', binding))
    }, 1000)
  }

  close(event) {
    this.emitter.emit('help-view-close-clicked')
  }

  handleButton(event) {
    let { target } = event.target.dataset
    log(target)
    this.emitter.emit(`command-center:button-clicked`, target)
    this.close()
  }
}
