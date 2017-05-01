'use babel'

import React from 'react'
import TableView from './table-view'
import MachineRow from './machine-row'

export default class MachinesTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = { powerProgress: {}, mountProgress: {} }
  }

  getHeadings() {
    return [
      { label: 'Alias', accessor: 'alias' },
      { label: 'Team', accessor: 'team' },
      { label: 'Machine Label', accessor: 'label' },
      { label: 'Ip', accessor: 'ip' },
      { label: 'Owner', accessor: m => m.owner || m.username || '' },
      { label: 'Provider', accessor: 'provider' },
      { label: 'Created At', accessor: 'createdAt' },
      { label: 'Copy id' },
      { label: 'Turn on/off' },
      { label: 'Terminal' },
      { label: 'Mount' },
      { label: 'Always On' },
    ]
  }

  setPowerProgress(machine, state) {
    this.setState({
      powerProgress: {
        ...this.state.powerProgress,
        [machine.id]: state,
      },
    })
  }

  setMountProgress(machine, state) {
    this.setState({
      mountProgress: {
        ...this.state.mountProgress,
        [machine.id]: state,
      },
    })
  }

  onTurnOn(machine, index) {
    this.setPowerProgress(machine, true)
    this.props
      .onTurnOn(machine, index)
      .then(() => this.setPowerProgress(machine, false))
      .catch(() => this.setPowerProgress(machine, false))
  }

  onTurnOff(machine, index) {
    this.setPowerProgress(machine, true)
    this.props
      .onTurnOff(machine, index)
      .then(() => this.setPowerProgress(machine, false))
      .catch(() => this.setPowerProgress(machine, false))
  }

  onMount(machine, index) {
    this.setMountProgress(machine, true)
    this.props
      .onMount(machine, index)
      .then(() => this.setMountProgress(machine, false))
      .catch(() => this.setMountProgress(machine, false))
  }

  renderRow(machine, index) {
    return (
      <MachineRow
        key={index}
        machine={machine}
        index={index}
        hasPowerProgress={this.state.powerProgress[machine.id]}
        hasMountProgress={this.state.mountProgress[machine.id]}
        onTurnOn={this.onTurnOn.bind(this)}
        onTurnOff={this.onTurnOff.bind(this)}
        onTerminal={this.props.onTerminal}
        onMount={this.onMount.bind(this)}
        onAlwaysOnChange={this.props.onAlwaysOnChange}
        onCopyId={this.props.onCopyId}
      />
    )
  }

  render() {
    const { machines, onClose, onReload } = this.props

    return (
      <TableView
        title="Machines"
        filterValue={this.props.filterValue}
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
  filterValue: React.PropTypes.string,
  onClose: React.PropTypes.func,
  onReload: React.PropTypes.func,
  onTurnOn: React.PropTypes.func,
  onTurnOff: React.PropTypes.func,
  onTerminal: React.PropTypes.func,
  onMount: React.PropTypes.func,
  onAlwaysOnChange: React.PropTypes.func,
  onCopyId: React.PropTypes.func,
}
