'use babel'

import { Emitter } from 'atom'
import { View } from 'atom-space-pen-views'

import { MachineStatusText, MachineStatus } from '../constants'

export default class MachineSettings extends View {

  initialize ({ machines }) {
    this.emitter = new Emitter()
    this.machines = machines
  }

  onClose () {
    this.emitter.emit('machine-settings:close')
  }

  onMount (event, element) {
    const machine = this.machines[element.data('index')]

    if (!machine) { return }

    this.emitter.emit('machine-settings:mount', { machine })
  }

  onTurnOn (event, element) {
    const machine = this.machines[element.data('index')]

    if (!machine) { return }

    this.emitter.emit('machine-settings:power-change', { machine, state: true })
  }

  onTurnOff (event, element) {
    const machine = this.machines[element.data('index')]

    if (!machine) { return }

    this.emitter.emit('machine-settings:power-change', {
      machine,
      state: false
    })
  }

  onAlwaysOnChange (event, element) {
    const machine = this.machines[element.data('index')]

    if (!machine) { return }

    const state = event.target.checked

    this.emitter.emit('machine-settings:always-on-change', { machine, state })
  }

  onShowLogs (event, element) {
    const machine = this.machines[element.data('index')]

    if (!machine) { return }

    this.emitter.emit('machine-settings:show-logs', { machine })
  }

  static content ({ machines }) {
    this.section({ class: 'section machine-settings' }, () => {
      this.div({ class: 'heading-container' }, () => {
        this.div({ class: 'section-heading' }, 'Machines')
        this.button(
          { class: 'btn btn-sm icon icon-x', click: 'onClose' },
          'Close'
        )
      })
      this.table({ class: 'table text' }, () => {
        this.thead(() => {
          this.tr(() => {
            // this.th('id')
            this.th('Alias')
            this.th('Team')
            this.th('Machine Label')
            this.th('Ip')
            this.th('Owner')
            this.th('Provider')
            this.th('Status')
            this.th('Created At')
            this.th('Turn on/off')
            this.th('Build logs')
            this.th('Mount')
            this.th('Always on')
          })
        })
        this.tbody(() => {
          machines.forEach((machine, index) => {
            this.tr(() => {
              const isOffline = machine.status === MachineStatus.Offline
              // this.td(machine.id)
              this.td(machine.alias)
              this.td(machine.team)
              this.td(machine.label)
              this.td(machine.ip)
              this.td(machine.owner || '')
              this.td(machine.provider)
              this.td(MachineStatusText[machine.status.state])
              this.td(machine.createdAt)
              this.td(() => this.button(
                {
                  class: 'btn btn-sm',
                  click: isOffline ? 'onTurnOn' : 'onTurnOff',
                  'data-index': index
                },
                isOffline ? 'Turn on' : 'Turn off'
              ))
              this.td(() => {
                this.button(
                  {
                    class: 'btn btn-sm',
                    click: 'onShowLogs',
                    'data-index': index
                  },
                  'show logs'
                )
              })
              this.td(() => this.button(
                {
                  class: 'btn btn-sm',
                  click: 'onMount',
                  'data-index': index
                },
                'Mount…'
              ))
              this.td({ class: 'centered' }, () => {
                this.input({
                  type: 'checkbox',
                  change: 'onAlwaysOnChange',
                  'data-index': index
                })
              })
            })
          })
        })
      })
    })
  }
}
