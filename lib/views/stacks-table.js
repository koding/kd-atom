'use babel'

import React from 'react'
import TableView from './table-view'
import StackRow from './stack-row'
import MachinesTable from './machines-table'

export default class StacksTable extends React.Component {
  getHeadings () {
    return [
      { label: 'Title', accessor: 'title' },
      { label: 'Team', accessor: 'group' },
      { label: 'Status', accessor: 'status.state' },
      { label: '' } // for show / hide machines
    ]
  }

  renderRow (stack, index, isExpanded, onExpand, onCollapse) {
    return (
      <StackRow
        key={index}
        stack={stack}
        index={index}
        expanded={isExpanded}
        onExpand={onExpand}
        onCollapse={onCollapse}
      />
    )
  }

  renderExpansion (stack, index) {
    return (
      <Expansion
        machines={stack.machines}
        onTurnOn={this.props.onTurnOn}
        onTurnOff={this.props.onTurnOff}
        onTerminal={this.props.onTerminal}
        onShowLogs={this.props.onShowLogs}
        onMount={this.props.onMount}
        onAlwaysOnChange={this.props.onAlwaysOnChange}
      />
    )
  }

  render () {
    const { stacks, onClose, onReload } = this.props

    return (
      <TableView
        expandable
        title="Stacks"
        headings={this.getHeadings()}
        items={stacks}
        onClose={onClose}
        onReload={onReload}
        renderRow={this.renderRow.bind(this)}
        renderExpansion={this.renderExpansion.bind(this)}
        noItem="No stack is found!"
      />
    )
  }
}

StacksTable.propTypes = {
  stacks: React.PropTypes.array,
  onClose: React.PropTypes.func,
  onReload: React.PropTypes.func,
  onTurnOn: React.PropTypes.func,
  onTurnOff: React.PropTypes.func,
  onTerminal: React.PropTypes.func,
  onShowLogs: React.PropTypes.func,
  onMount: React.PropTypes.func,
  onAlwaysOnChange: React.PropTypes.func,
}

const Expansion = ({
  machines,
  onTurnOn,
  onTurnOff,
  onTerminal,
  onShowLogs,
  onMount,
  onAlwaysOnChange,
}) => (
  <tr>
    <td colSpan={4}>
      <MachinesTable
        compact
        machines={machines}
        onTurnOn={onTurnOn}
        onTurnOff={onTurnOff}
        onTerminal={onTerminal}
        onShowLogs={onShowLogs}
        onMount={onMount}
        onAlwaysOnChange={onAlwaysOnChange}
      />
    </td>
  </tr>
)

Expansion.propTypes = {
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
