'use babel'

import { Emitter } from 'atom'
import { View } from 'atom-space-pen-views'

export default class MountSettings extends View {
  initialize ({ mounts, options }) {
    this.emitter = new Emitter()
    this.mounts = mounts
    this.options = options
  }

  onClose () {
    this.options.onClose()
  }

  onOpen (event, element) {
    const mount = this.mounts[element.data('index')]

    if (!mount) { return }

    this.options.onOpen({ mount })
  }

  onNewWindow (event, element) {
    const mount = this.mounts[element.data('index')]

    if (!mount) { return }

    this.options.onNewWindow({ mount })
  }

  onUnmount (event, element) {
    const mount = this.mounts[element.data('index')]

    if (!mount) { return }

    this.options.onUnmount({ mount })
  }

  static content ({ mounts }) {
    this.section({ class: 'section machine-settings' }, () => {
      this.div({ class: 'heading-container' }, () => {
        this.div({ class: 'section-heading' }, 'Mounts')
        this.button(
          { class: 'btn btn-sm icon icon-x', click: 'onClose' },
          'Close'
        )
      })

      if (!mounts.length) {
        this.div(
          'No active mounts. run `kd:machines` to see available machines.'
        )
        return
      }

      this.table({ class: 'table text' }, () => {
        this.thead(() => {
          this.tr(() => {
            // this.th('id')
            this.th('Label')
            this.th('Local Path')
            this.th('Remote Path')
            this.th('Open')
            this.th('Unmount')
          })
        })
        this.tbody(() => {
          mounts.forEach((mount, index) => {
            this.tr(() => {
              // this.td(mount.id)
              this.td(mount.label)
              this.td(mount.mount.path)
              this.td(mount.mount.remotePath)
              this.td(() => {
                this.div({ class: 'btn-group btn-group-sm' }, () => {
                  this.button({
                    class: 'btn',
                    click: 'onOpen',
                    'data-index': index
                  }, 'Open')
                  this.button({
                    class: 'btn icon icon-link-external',
                    click: 'onNewWindow',
                    'data-index': index
                  })
                })
              })
              this.td(() => this.button(
                {
                  class: 'btn btn-sm btn-error',
                  click: 'onUnmount',
                  'data-index': index
                },
                'Unmount'
              ))
            })
          })
        })
      })
    })
  }
}
