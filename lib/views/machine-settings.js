'use babel'
/* globals atom */

import { Emitter, CompositeDisposable } from 'atom'
import { View } from 'atom-space-pen-views'
import React from 'react'
import { render } from 'react-dom'

import MachinesTable from './machines-table'

export default class MachineSettings extends View {
  static content ({ machines }) {
    this.section({ class: 'machines-list-container' })
  }

  initialize ({ machines }) {
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
    this.machines = machines
  }

  addStateTooltip (el) {
    this.subscriptions.add(atom.tooltips.add(el, {
      title: `Machine Status: ${el.dataset.state}`
    }))
  }

  destroy () {
    this.subscriptions.dispose()
  }

  onClose () {
    this.emitter.emit('machine-settings:close')
  }

  onReload () {
    this.emitter.emit('machine-settings:reload')
  }

  onMount (machine) {
    this.emitter.emit('machine-settings:mount', { machine })
  }

  onTurnOn (machine) {
    this.emitter.emit('machine-settings:power-change', {
      machine,
      state: true,
      from: 'machines'
    })
  }

  onTurnOff (machine) {
    this.emitter.emit('machine-settings:power-change', {
      machine,
      state: false,
      from: 'machines'
    })
  }

  onAlwaysOnChange (machine) {
    this.emitter.emit('machine-settings:always-on-change', { machine })
  }

  onShowLogs (machine) {
    this.emitter.emit('machine-settings:show-logs', { machine })
  }

  onTerminal (machine) {
    this.emitter.emit('machine-settings:open-terminal', { machine })
  }

  attached () {
    this.renderTable({ machines: this.machines })
  }

  renderTable ({ machines }) {
    render(
      <MachinesTable
        machines={machines}
        onClose={this.onClose.bind(this)}
        onReload={this.onReload.bind(this)}
        onTurnOn={this.onTurnOn.bind(this)}
        onTurnOff={this.onTurnOff.bind(this)}
        onTerminal={this.onTerminal.bind(this)}
        onShowLogs={this.onShowLogs.bind(this)}
        onMount={this.onMount.bind(this)}
        onAlwaysOnChange={this.onAlwaysOnChange.bind(this)}
      />,
      this.element
    )

    this.find('.icon-server').each((i, el) => {
      this.addStateTooltip(el)
    })
  }
}
