'use babel'

import { Emitter } from 'atom'
import { View } from 'atom-space-pen-views'
import React from 'react'
import { render } from 'react-dom'
import { find } from 'lodash'

import MountsTable from './mounts-table'

export default class MountSettings extends View {
  static content ({ mounts }) {
    this.section({ class: 'machines-list-container' })
  }

  initialize ({ mounts, machines, options }) {
    this.emitter = new Emitter()
    this.options = options
    this.mounts = mounts.map(mount => ({
      ...mount,
      machine: find(machines, { alias: mount.label })
    }))
  }

  onClose () {
    this.options.onClose()
  }

  onReload () {
    this.options.onReload()
  }

  onOpen (mount) {
    this.options.onOpen({ mount })
  }

  onNewWindow (mount) {
    this.options.onNewWindow({ mount })
  }

  onUnmount (mount) {
    this.options.onUnmount({ mount })
  }

  attached () {
    this.renderTable({ mounts: this.mounts })
  }

  renderTable ({ mounts }) {
    render(
      <MountsTable
        mounts={mounts}
        onClose={this.onClose.bind(this)}
        onReload={this.onReload.bind(this)}
        onOpen={this.onOpen.bind(this)}
        onNewWindow={this.onNewWindow.bind(this)}
        onUnmont={this.onUnmount.bind(this)}
      />,
      this.element
    )
  }
}
