'use babel'

import React from 'react'

const MountRow = ({ mount, index, onOpen, onNewWindow, onUnmount }) => {
  const _onOpen = () => onOpen(mount, index)
  const _onNewWindow = () => onNewWindow(mount, index)
  const _onUnmount = () => onUnmount(mount, index)

  return (
    <tr>
      <td>{mount.label}</td>
      <td>{mount.mount.path}</td>
      <td>{mount.mount.remotePath}</td>
      <td>
        <div className='btn-group btn-group-sm'>
          <button
            className='btn'
            onClick={_onOpen}
            children='Open'
          />
          <button
            className='btn icon icon-link-external'
            onClick={_onNewWindow}
          />
        </div>
      </td>
      <td>
        <button
          className='btn btn-sm btn-error'
          onClick={_onUnmount}
          children='Unmount'
        />
      </td>
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

export default MountRow
