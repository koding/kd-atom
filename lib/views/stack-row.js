'use babel'

import React from 'react'

const StackRow = ({ stack, index, expanded, onCollapse, onExpand }) => {
  const iconClass = expanded ? 'icon-triangle-down' : 'icon-triangle-right'
  return (
    <tr>
      <td style={{ width: '70%' }}>{stack.title}</td>
      <td style={{ width: '10%' }}>{stack.group}</td>
      <td style={{ width: '10%' }}>{stack.status.state}</td>
      <td style={{ width: '10%' }}>
        <button
          className={`btn btn-sm icon ${iconClass}`}
          onClick={expanded ? onCollapse : onExpand}
          children={expanded ? 'Hide Machines' : 'Show Machines'}
        />
      </td>
    </tr>
  )
}

StackRow.propTypes = {
  stack: React.PropTypes.object,
  index: React.PropTypes.number,
  expanded: React.PropTypes.bool,
  onCollapse: React.PropTypes.func,
  onExpand: React.PropTypes.func,
}

export default StackRow
