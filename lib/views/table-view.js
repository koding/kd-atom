'use babel'

import React from 'react'

const TableView = ({ onReload, onClose, headings, items, renderRow }) => (
  <section className='section table-view'>
    <div className="heading-container">
      <div className="section-heading">Machines</div>
      <button className="btn btn-sm icon icon-sync" onClick={onReload}>
        Reload
      </button>
      <button className="btn btn-sm icon icon-x" onClick={onClose}>
        Close
      </button>
    </div>
    <table className='table text'>
      <thead>
        <tr>
          {headings.map((heading, index) => <th key={index}>{heading}</th>)}
        </tr>
      </thead>
      <tbody>{items.map(renderRow)}</tbody>
    </table>
  </section>
)

TableView.propTypes = {
  onReload: React.PropTypes.func,
  onClose: React.PropTypes.func,
  headings: React.PropTypes.array,
  items: React.PropTypes.array,
  renderRow: React.PropTypes.func
}
export default TableView
