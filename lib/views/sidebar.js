'use babel'

import debug from 'debug'
import execa from 'execa'
import { Emitter } from 'atom'
import { ScrollView } from 'atom-space-pen-views'
import { Icons } from '../../assets/svgs'

const log = debug('views:log')
const error = debug('app:err')
const STATUS = ['', 'stopped', '', 'running']

export default class Sidebar extends ScrollView {
  // @div class: 'tree-view-resizer tool-panel', 'data-show-on-right-side': atom.config.get('tree-view.showOnRightSide'), =>
  //   @div class: 'tree-view-scroller order--center', outlet: 'scroller', =>
  //     @ol class: 'tree-view full-menu list-tree has-collapsable-children focusable-panel', tabindex: -1, outlet: 'list'
  //   @div class: 'tree-view-resize-handle', outlet: 'resizeHandle'
  static content ({team, account}) {
    log('sidebar', { team, account })
    this.div({ class: 'koding-sidebar-stacks' }, () => {
      this.header(() => {
        if (team.customize != null && team.customize.logo != null) {
          this.img({ class: 'team-logo', src: team.customize.logo })
        } else {
          this.figure({ class: 'team-logo', style: `background-image: ${Icons.teamLogo}` })
        }
        this.div(() => {
          this.h1(team.title)
          this.h2(`@${account.profile.nickname}`)
        })
      })
      this.div({ class: 'tree-view-scroller order--center' }, () => {
        this.ol({ class: 'tree-view full-menu list-tree', outlet: 'machines' })
      })
      this.button({ class: 'btn btn-info', outlet: 'logout' }, 'Logout')
      this.button({ class: 'btn cancel pull-right', outlet: 'print' }, 'Print')
    })
  }

  initialize ({team, account, machines}) {
    super.initialize()
    this.emitter = new Emitter()
    this.stacks = {}
    this.team = team

    this.logout.click(e => { this.emitter.emit('logout-clicked') })
    this.print.click(e => { this.emitter.emit('print-clicked') })

    if (machines) {
      this.prepareStacks(machines)
      this.drawMachines()
    } else {
      execa.shell('KD_EXPERIMENTAL=1 kd machine list --json').then(res => {
        let machines = JSON.parse(res.stdout)
        this.emitter.emit('machines-fetched', machines)
        log('machines', machines)
        this.prepareStacks(machines)
        this.drawMachines()
      }).catch(err => {
        error(err)
      })
    }
  }

  prepareStacks (machines) {
    let teamMachines = []
    machines.map(machine => {
      if (machine.team === this.team.slug) {
        teamMachines.push(machine)
      }
    })
    log('team machines', teamMachines)
    teamMachines.forEach(machine => {
      if (this.stacks[machine.stack]) {
        this.stacks[machine.stack].push(machine)
      } else {
        this.stacks[machine.stack] = [machine]
      }
    })
  }

  drawMachines () {
    for (let label in this.stacks) {
      let stack = this.stacks[label]
      let stackTitle = document.createElement('li')
      let vms = document.createElement('ol')
      stackTitle.classList.add('directory', 'entry', 'list-nested-item', 'expanded')
      vms.classList.add('entries', 'list-tree')
      stackTitle.innerHTML = `
        <div class='header list-item'>
          <span class='name icon'>${Icons.stacks}${label}</span>
        </div>`
      stackTitle.appendChild(vms)
      this.machines.append(stackTitle)

      stack.forEach(machine => {
        let vmIcon = Icons.vmTurnedOff
        if (machine.status.state === 3) { vmIcon = Icons.vmTurnedOn }
        vms.insertAdjacentHTML('beforeend', `
          <li data-alias='${machine.alias}' data-id='${machine.id}' class='file entry list-item vm-item ${STATUS[machine.status.state]}' alt='${machine.status.reason}'>
            <span class='name'>${vmIcon}${machine.label}</span>
          </li>`)
      })
    }
    this.bindVMEvents()
  }

  bindVMEvents () {
    this.find('li.vm-item').click(e => {
      if (!e.currentTarget.classList.contains('vm-item')) {
        return false
      }
      let vmItem = e.currentTarget
      log(vmItem.dataset)
    })
  }
}
