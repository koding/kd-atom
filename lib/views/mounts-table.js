'use babel'

import React from 'react'
import TableView from './table-view'
import MountRow from './mount-row'

export default class MountsTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = { mountProgress: {} }
  }

  getHeadings() {
    return [
      { label: 'Label', accessor: 'label' },
      { label: 'Local Path', accessor: 'mount.path' },
      { label: 'Remote Path', accessor: 'mount.remotePath' },
      { label: 'Open' },
      { label: 'Unmount' },
    ]
  }

  setMountProgress(mount, state) {
    this.setState({
      mountProgress: {
        ...this.state.mountProgress,
        [mount.id]: state,
      },
    })
  }

  onUnmount(mount, index) {
    this.setMountProgress(mount, true)
    this.props
      .onUnmount(mount, index)
      .then(() => this.setMountProgress(mount, false))
      .catch(() => this.setMountProgress(mount, false))
  }

  renderRow(mount, index) {
    return (
      <MountRow
        key={index}
        mount={mount}
        hasMountProgress={this.state.mountProgress[mount.id]}
        index={index}
        onOpen={this.props.onOpen}
        onNewWindow={this.props.onNewWindow}
        onUnmount={this.onUnmount.bind(this)}
        onShowMachine={this.props.onShowMachine}
      />
    )
  }

  render() {
    const { mounts, onClose, onReload } = this.props

    return (
      <TableView
        title="Mounts"
        headings={this.getHeadings()}
        items={mounts}
        onClose={onClose}
        onReload={onReload}
        renderRow={this.renderRow.bind(this)}
        colCount={5}
        noItem="No mount is found!"
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
  onShowMachine: React.PropTypes.func,
}
