'use babel'

import React from 'react'
import cx from 'classnames'

import formatDate from '../utils/format-date'
import { MachineStatusText, MachineStatus } from '../constants'

const MachineRow = ({
  machine,
  index,
  hasPowerProgress,
  hasMountProgress,
  onTurnOn,
  onTurnOff,
  onTerminal,
  onMount,
  onAlwaysOnChange,
  onCopyId,
}) => {
  const status = MachineStatusText[machine.status.state] || ''
  const isOffline = machine.status.state === MachineStatus.Offline
  const platform = require('os').platform()

  const powerBtnClass = cx('btn btn-sm btn-progress icon', {
    'btn-info icon-triangle-right': !!isOffline,
    'icon-primitive-square': !isOffline,
    'has-progress': !!hasPowerProgress,
  })

  const mountBtnClass = cx('btn btn-sm btn-progress', {
    'has-progress': !!hasMountProgress,
  })

  const _onTurnOn = () => onTurnOn(machine, index)
  const _onTurnOff = () => onTurnOff(machine, index)
  const _onTerminal = () => onTerminal(machine, index)
  const _onMount = () => onMount(machine, index)
  const _onAlwaysChange = () => onAlwaysOnChange(machine, index)
  const _onCopyId = () => onCopyId(machine, 'machine', index)

  return (
    <tr className={status.toLowerCase()}>
      <td className="icon icon-server" data-state={status}>
        {machine.alias}
      </td>
      <td>{machine.team}</td>
      <td>{machine.label}</td>
      <td>{machine.ip}</td>
      <td>{machine.owner || machine.username || ''}</td>
      <td>{machine.provider}</td>
      <td>{formatDate(machine.createdAt)}</td>
      <td className="centered">
        <button
          className="btn btn-sm icon icon-clippy"
          children="Copy id"
          onClick={_onCopyId}
        />
      </td>
      <td className="centered">
        <button
          className={powerBtnClass}
          onClick={isOffline ? _onTurnOn : _onTurnOff}
          children={isOffline ? 'Turn On' : 'Turn off'}
          disabled={!!hasPowerProgress}
        />
      </td>
      {platform === 'darwin' &&
        <td className="centered">
          <button
            className="btn btn-sm icon icon-terminal"
            onClick={_onTerminal}
            children="ssh"
          />
        </td>}
      <td className="centered">
        <button
          className={mountBtnClass}
          onClick={_onMount}
          children="Mount…"
          disabled={!!hasMountProgress}
        />
      </td>
      <td className="centered">
        <input type="checkbox" onChange={_onAlwaysChange} disabled />
      </td>
    </tr>
  )
}

MachineRow.propTypes = {
  machine: React.PropTypes.object,
  index: React.PropTypes.number,
  hasPowerProgress: React.PropTypes.bool,
  hasMountProgress: React.PropTypes.bool,
  onTurnOn: React.PropTypes.func,
  onTurnOff: React.PropTypes.func,
  onTerminal: React.PropTypes.func,
  onMount: React.PropTypes.func,
  onAlwaysOnChange: React.PropTypes.func,
  onCopyId: React.PropTypes.func,
}

export default MachineRow
