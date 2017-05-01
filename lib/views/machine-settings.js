'use babel'
/* globals atom */

import { Emitter, CompositeDisposable } from 'atom'
import { View } from 'atom-space-pen-views'
import React from 'react'
import { render } from 'react-dom'

import MachinesTable from './machines-table'

export default class MachineSettings extends View {
  static content({ machines }) {
    this.section({ class: 'machines-list-container' })
  }

  initialize({ machines, options }) {
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
    this.machines = machines
    this.options = options
  }

  addStateTooltip(el) {
    this.subscriptions.add(
      atom.tooltips.add(el, {
        title: `Machine Status: ${el.dataset.state}`,
      })
    )
  }

  destroy() {
    this.subscriptions.dispose()
  }

  onClose() {
    this.options.onClose()
  }

  onReload() {
    return this.options.onReload()
  }

  onMount(machine) {
    return this.options.onMount({ machine })
  }

  onTurnOn(machine) {
    return this.options.onPowerChange({ machine, state: true })
  }

  onTurnOff(machine) {
    return this.options.onPowerChange({ machine, state: false })
  }

  onAlwaysOnChange(machine) {
    return this.options.onAlwaysOnChange({ machine })
  }

  onTerminal(machine) {
    return this.options.onTerminal({ machine })
  }

  onCopyId(machine, name, index) {
    return this.options.onCopyId(machine, name, index)
  }

  attached() {
    this.renderTable({ machines: this.machines })
  }

  renderTable({ machines }) {
    render(
      <MachinesTable
        machines={machines}
        filterValue={this.filterValue}
        onClose={this.options.onClose}
        onReload={this.onReload.bind(this)}
        onTurnOn={this.onTurnOn.bind(this)}
        onTurnOff={this.onTurnOff.bind(this)}
        onTerminal={this.onTerminal.bind(this)}
        onMount={this.onMount.bind(this)}
        onAlwaysOnChange={this.onAlwaysOnChange.bind(this)}
        onCopyId={this.onCopyId.bind(this)}
      />,
      this.element
    )

    this.find('.icon-server').each((i, el) => {
      this.addStateTooltip(el)
    })
  }
}
