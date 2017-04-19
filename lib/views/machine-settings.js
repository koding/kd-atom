'use babel'
/* globals atom */

import { Emitter, CompositeDisposable } from 'atom'
import { View } from 'atom-space-pen-views'
import moment from 'moment'
import debug from 'debug'

import { MachineStatusText, MachineStatus } from '../constants'
const log = debug('machine-settings:log')

export default class MachineSettings extends View {

  initialize ({ machines }) {
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
    this.machines = machines
    this.find('.icon-server').each((i, el) => {
      this.addStateTooltip(el)
    })
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

  onTerminal (event, element) {
    const machine = this.machines[element.data('index')]

    if (!machine) { return }

    this.emitter.emit('machine-settings:open-terminal', { machine })
  }

  static content ({ machines }) {
    this.section({ class: 'section machine-settings' }, () => {
      this.div({ class: 'heading-container' }, () => {
        this.div({ class: 'section-heading' }, 'Machines')
        this.button({
          class: 'btn btn-sm icon icon-sync',
          click: 'onReload'
        }, 'Reload')
        this.button({
          class: 'btn btn-sm icon icon-x',
          click: 'onClose'
        }, 'Close')
      })
      this.table({ class: 'table text' }, () => {
        this.thead(() => {
          this.tr(() => {
            this.th('Alias')
            this.th('Team')
            this.th('Machine Label')
            this.th('Ip')
            this.th('Owner')
            this.th('Provider')
            // this.th('Status')
            this.th('Created At')
            this.th('Turn on/off')
            this.th('Terminal')
            this.th('Build logs')
            this.th('Mount')
            this.th('Always on')
          })
        })
        this.tbody(() => {
          machines.forEach((machine, index) => {
            let state = MachineStatusText[machine.status.state] || ''
            this.tr({
              class: `${state.toLowerCase()}`
            }, () => {
              const isOffline = machine.status.state === MachineStatus.Offline
              this.td({
                class: 'icon icon-server',
                'data-state': state
              }, machine.alias)
              this.td(machine.team)
              this.td(machine.label)
              this.td(machine.ip)
              this.td(machine.owner || machine.username || '')
              this.td(machine.provider)
              let formats = {
                sameDay: '[Today] hh:mm:ss',
                lastDay: '[Yesterday] hh:mm:ss',
                lastWeek: '[Last] dddd',
                sameElse: 'MMM Do, YYYY, hh:mm:ss'
              }
              let btnCls = isOffline
                           ? 'btn-info icon-triangle-right'
                           : 'icon-primitive-square'
              this.td(moment(machine.createdAt).calendar(null, formats))
              this.td({ class: 'centered' }, () => this.button(
                {
                  class: `btn btn-sm icon ${btnCls}`,
                  click: isOffline ? 'onTurnOn' : 'onTurnOff',
                  'data-index': index
                },
                isOffline ? 'Turn on' : 'Turn off'
              ))
              this.td({ class: 'centered' }, () => this.button(
                {
                  class: 'btn btn-sm icon icon-terminal',
                  click: 'onTerminal',
                  'data-index': index
                }, 'ssh'
              ))
              this.td({ class: 'centered' }, () => {
                this.button(
                  {
                    class: 'btn btn-sm',
                    click: 'onShowLogs',
                    'data-index': index
                  },
                  'Logs…'
                )
              })
              this.td({ class: 'centered' }, () => this.button(
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
