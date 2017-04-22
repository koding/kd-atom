'use babel'

import React from 'react'
import TableView from './table-view'
import MountRow from './mount-row'

export default class MountsTable extends React.Component {
  getHeadings () {
    return [
      'Label',
      'Local Path',
      'Remote Path',
      'Open',
      'Unmount',
    ]
  }

  renderRow (mount, index) {
    return (
      <MountRow
        mount={mount}
        index={index}
        onOpen={this.props.onOpen}
        onNewWindow={this.props.onNewWindow}
        onUnmount={this.props.onUnmount}
      />
    )
  }

  render () {
    const { mounts, onClose, onReload } = this.props

    return (
      <TableView
        headings={this.getHeadings()}
        items={mounts}
        onClose={onClose}
        onReload={onReload}
        renderRow={this.renderRow.bind(this)}
      />
    )
  }
}

MountsTable.propTypes = {
  mounts: React.PropTypes.array,
  onClose: React.PropTypes.func,
  onReload: React.PropTypes.func,
  onOpen: React.PropTypes.func,
  onNewWindow: React.PropTypes.func,
  onUnmount: React.PropTypes.func,
}
