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
      { label: 'Alias', accessor: 'alias' },
      { label: 'Team', accessor: 'team' },
      { label: 'Machine Label', accessor: 'label' },
      { label: 'Ip', accessor: 'ip' },
      { label: 'Owner', accessor: m => m.owner || m.username || '' },
      { label: 'Provider', accessor: 'provider' },
      { label: 'Created At', accessor: 'createdAt' },
      { label: 'Turn on/off' },
      { label: 'Terminal' },
      { label: 'Build Logs' },
      { label: 'Mount' },
      { label: 'Always On' },
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
        key={index}
        machine={machine}
        index={index}
        hasPowerProgress={this.state.powerProgress[machine.id]}
        onTurnOn={this.onTurnOn.bind(this)}
        onTurnOff={this.onTurnOff.bind(this)}
        onTerminal={this.props.onTerminal}
        onShowLogs={this.props.onShowLogs}
        onMount={this.props.onMount}
        onAlwaysOnChange={this.props.onAlwaysOnChange}
      />
    )
  }

  render () {
    const { machines, onClose, onReload } = this.props

    return (
      <TableView
        title="Machines"
        headings={this.getHeadings()}
        items={machines}
        onClose={onClose}
        onReload={onReload}
        renderRow={this.renderRow.bind(this)}
        colCount={12}
        noItem="No machine is found!"
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
