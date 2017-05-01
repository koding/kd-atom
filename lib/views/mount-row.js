'use babel'

import React from 'react'
import cx from 'classnames'

import { MachineStatus } from '../constants'

const MountRow = ({
  mount,
  index,
  onOpen,
  onNewWindow,
  onUnmount,
  onShowMachine,
  hasMountProgress,
}) => {
  const _onOpen = () => onOpen(mount, index)
  const _onNewWindow = () => onNewWindow(mount, index)
  const _onUnmount = () => onUnmount(mount, index)
  const _onShowMachine = () => onShowMachine(mount.machine)

  if (isOffline(mount)) {
    return (
      <tr className="cursor-pointer" onClick={_onShowMachine}>
        <td>{mount.label}</td>
        <td colSpan="4">
          Mounted machine is offline.
          Close this window and run <strong>kd:machines</strong> to turn it on.
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td>{mount.label}</td>
      <td>{mount.mount.path}</td>
      <td>{mount.mount.remotePath}</td>
      {mount.machine
        ? <OpenCell onOpen={_onOpen} onNewWindow={_onNewWindow} />
        : <BrokenMount />}
      <MountAction
        hasProgress={hasMountProgress}
        mount={mount}
        onUnmount={_onUnmount}
      />
    </tr>
  )
}

MountRow.propTypes = {
  mount: React.PropTypes.object,
  hasMountProgress: React.PropTypes.bool,
  index: React.PropTypes.number,
  onOpen: React.PropTypes.func,
  onNewWindow: React.PropTypes.func,
  onUnmount: React.PropTypes.func,
  onShowMachine: React.PropTypes.func,
}

const BrokenMount = () => (
  <td>
    Mount is broken. Please unmount.
  </td>
)

const OpenCell = ({ onOpen, onNewWindow }) => (
  <td>
    <div className="btn-group btn-group-sm">
      <button className="btn" onClick={onOpen} children="Open" />
      <button className="btn icon icon-link-external" onClick={onNewWindow} />
    </div>
  </td>
)

OpenCell.propTypes = {
  onOpen: React.PropTypes.func,
  onNewWindow: React.PropTypes.func,
}

const MountAction = ({ mount, onUnmount, hasProgress }) => {
  const className = cx('btn btn-sm btn-error btn-progress', {
    'has-progress': !!hasProgress,
  })

  return (
    <td>
      <button
        className={className}
        onClick={onUnmount}
        children="Unmount"
        disabled={hasProgress || isOffline(mount)}
      />
    </td>
  )
}

MountAction.propTypes = {
  mount: React.PropTypes.object,
  onUnmount: React.PropTypes.func,
  hasProgress: React.PropTypes.bool,
}

const isOffline = mount =>
  mount.machine && mount.machine.status.state === MachineStatus.Offline

export default MountRow
