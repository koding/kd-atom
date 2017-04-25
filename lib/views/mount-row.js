'use babel'

import React from 'react'

import { MachineStatus } from '../constants'

const MountRow = ({ mount, index, onOpen, onNewWindow, onUnmount }) => {
  const _onOpen = () => onOpen(mount, index)
  const _onNewWindow = () => onNewWindow(mount, index)
  const _onUnmount = () => onUnmount(mount, index)

  if (isOffline(mount)) {
    return (
      <tr>
        <td>{mount.label}</td>
        <td colSpan='4'>
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
      <OpenCell onOpen={_onOpen} onNewWindow={_onNewWindow} />
      <MountAction mount={mount} onUnmount={_onUnmount} />
    </tr>
  )
}

MountRow.propTypes = {
  mount: React.PropTypes.object,
  index: React.PropTypes.number,
  onOpen: React.PropTypes.func,
  onNewWindow: React.PropTypes.func,
  onUnmount: React.PropTypes.func,
}

const OpenCell = ({ onOpen, onNewWindow }) => (
  <td>
    <div className='btn-group btn-group-sm'>
      <button
        className='btn'
        onClick={onOpen}
        children='Open'
      />
      <button
        className='btn icon icon-link-external'
        onClick={onNewWindow}
      />
    </div>
  </td>
)

OpenCell.propTypes = {
  onOpen: React.PropTypes.func,
  onNewWindow: React.PropTypes.func,
}

const MountAction = ({ mount, onUnmount }) => {
  return (
    <td>
      <button
        className='btn btn-sm btn-error'
        onClick={onUnmount}
        children='Unmount'
        disabled={isOffline(mount)}
      />
    </td>
  )
}

MountAction.propTypes = {
  mount: React.PropTypes.object,
  onUnmount: React.PropTypes.func,
}

const isOffline = mount => mount.machine.status.state === MachineStatus.Offline

export default MountRow
