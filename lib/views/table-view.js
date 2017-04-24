'use babel'

import React from 'react'
import cx from 'classnames'
import { isString, isFunction, sortBy, get } from 'lodash'

export default class TableView extends React.Component {
  constructor (props) {
    super(props)

    this.state = { sortAccessor: null, sortLabel: null, sortType: null }
  }

  setSortedHeading ({ accessor, label }) {
    const { sortLabel, sortType } = this.state

    let newState = {}

    if (sortLabel === label) {
      if (!sortType) {
        newState.sortType = 'desc'
      } else if (sortType === 'desc') {
        newState.sortType = 'asc'
      } else if (sortType === 'asc') {
        newState.sortAccessor = null
        newState.sortLabel = null
        newState.sortType = null
      }
    } else {
      newState.sortAccessor = accessor
      newState.sortLabel = label
      newState.sortType = 'desc'
    }

    this.setState(newState)
  }

  renderHeading (heading, index) {
    let props = {}

    if (isString(heading)) {
      heading = { label: heading }
    }

    const { accessor, label } = heading

    // if there is an accessor for this column,
    // set sortAccessor state to this column's accessor
    if (accessor) {
      props.onClick = () => this.setSortedHeading(heading)
    }

    props.className = cx({
      'has-action': !!accessor,
      'is-sorted': this.state.sortLabel === heading.label,
      asc: this.state.sortType === 'asc',
      desc: this.state.sortType === 'desc',
    })

    props.children = label

    return <th key={index} {...props} />
  }

  render () {
    const { title, onReload, onClose, headings, items, renderRow } = this.props
    const { sortAccessor, sortType } = this.state

    let _items = items
    if (sortAccessor) {
      if (isFunction(sortAccessor)) {
        _items = sortBy(items, item => sortAccessor(item))
      } else {
        _items = sortBy(items, item => get(item, sortAccessor))
      }

      if (sortType === 'desc') {
        _items.reverse()
      }
    }

    return (
      <section className="section table-view">
        <div className="heading-container">
          <div className="section-heading">{title}</div>
          <button className="btn btn-sm icon icon-sync" onClick={onReload}>
            Reload
          </button>
          <button className="btn btn-sm icon icon-x" onClick={onClose}>
            Close
          </button>
        </div>
        <table className="table text">
          <thead>
            <tr>
              {headings.map(this.renderHeading.bind(this))}
            </tr>
          </thead>
          <tbody>{_items.map(renderRow)}</tbody>
        </table>
      </section>
    )
  }
}

TableView.propTypes = {
  title: React.PropTypes.string.isRequired,
  onReload: React.PropTypes.func,
  onClose: React.PropTypes.func,
  headings: React.PropTypes.array,
  items: React.PropTypes.array,
  renderRow: React.PropTypes.func,
}
