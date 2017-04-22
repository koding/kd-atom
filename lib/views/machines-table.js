'use babel'

import React from 'react'
import TableView from './table-view'
import MachineRow from './machine-row'

export default class MachinesTable extends React.Component {
  constructor (props) {
    super(props)
    this.state = { powerProgress: {} }
  }

  getHeadings () {
    return [
      'Alias',
      'Team',
      'Machine Label',
      'Ip',
      'Owner',
      'Provider',
      'Created At',
      'Turn on/off',
      'Terminal',
      'Build logs',
      'Mount',
      'Always on',
    ]
  }

  setPowerProgress (machine) {
    this.setState({
      powerProgress: {
        ...this.state.powerProgress,
        [machine.id]: true,
      },
    })
  }

  onTurnOn (machine, index) {
    this.setPowerProgress(machine)
    this.props.onTurnOn(machine, index)
  }

  onTurnOff (machine, index) {
    this.setPowerProgress(machine)
    this.props.onTurnOff(machine, index)
  }

  renderRow (machine, index) {
    return (
      <MachineRow
        machine={machine}
        index={index}
        hasPowerProgress={this.state.powerProgress[machine.id]}
        onTurnOn={this.onTurnOn.bind(this)}
        onTurnOff={this.onTurnOff.bind(this)}
        onTerminal={this.props.onTerminal}
        onShowLogs={this.props.onShowLogs}
        onAlwaysOnChange={this.props.onAlwaysOnChange}
      />
    )
  }

  render () {
    const { machines, onClose, onReload } = this.props

    return (
      <TableView
        headings={this.getHeadings()}
        items={machines}
        onClose={onClose}
        onReload={onReload}
        renderRow={this.renderRow.bind(this)}
      />
    )
  }
}

MachinesTable.propTypes = {
  machines: React.PropTypes.array,
  onClose: React.PropTypes.func,
  onReload: React.PropTypes.func,
  onTurnOn: React.PropTypes.func,
  onTurnOff: React.PropTypes.func,
  onTerminal: React.PropTypes.func,
  onShowLogs: React.PropTypes.func,
  onMount: React.PropTypes.func,
  onAlwaysOnChange: React.PropTypes.func,
}
