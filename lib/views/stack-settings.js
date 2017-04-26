'use babel'

import { Emitter } from 'atom'
import { View } from 'atom-space-pen-views'
import React from 'react'
import { render } from 'react-dom'
import { find } from 'lodash'

import StacksTable from './stacks-table'

export default class StackSettings extends View {
  static content () {
    this.section({ class: 'machines-list-container' })
  }

  initialize ({ stacks, machines, options }) {
    this.emitter = new Emitter()
    this.options = options

    this.stacks = stacks.map(stack => {
      console.log({ title: stack.title, machines: stack.machines })
      return {
        ...stack,
        machines: stack.machines.map(id =>
          find(machines, machine => machine.id === id)
        ),
      }
    })
  }

  onClose () {
    this.options.onClose()
  }

  onReload () {
    this.options.onReload()
  }

  onMount (machine) {
    this.options.onMount({ machine })
  }

  onTurnOn (machine) {
    this.options.onPowerChange({ machine, state: true, from: 'stacks' })
  }

  onTurnOff (machine) {
    this.options.onPowerChange({ machine, state: false, from: 'stacks' })
  }

  onAlwaysOnChange (machine) {
    this.options.onAlwaysOnChange({ machine })
  }

  onShowLogs (machine) {
    this.options.onShowLogs({ machine })
  }

  onTerminal (machine) {
    this.options.onTerminal({ machine })
  }

  attached () {
    this.renderTable({ stacks: this.stacks })
  }

  renderTable ({ stacks }) {
    render(
      <StacksTable
        stacks={stacks}
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
  }
}
