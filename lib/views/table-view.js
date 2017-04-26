'use babel'

import React from 'react'
import cx from 'classnames'
import { isString, isFunction, sortBy, get, flatten } from 'lodash'

import AtomInput from './atom-input'

export default class TableView extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      sortAccessor: null,
      sortLabel: null,
      sortType: null,
      filterValue: '',
    }
  }

  onFilterChange (filterValue) {
    this.setState({ filterValue })
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

  renderNoItem (noItem, colSpan) {
    return <tr><td colSpan={colSpan}>{noItem}</td></tr>
  }

  render () {
    const { title, onReload, onClose, headings,
            items, renderRow, noItem, colCount } = this.props
    const { sortAccessor, sortType, filterValue } = this.state

    let _items = items

    const accessors = getAccessors(headings)

    if (filterValue) {
      const filterRegExp = new RegExp(filterValue)
      _items = _items.filter(item => {
        for (let accessor of accessors) {
          if (filterRegExp.test(access(item, accessor))) {
            return true
          }
        }
        return false
      })
    }

    if (sortAccessor) {
      _items = sortBy(items, item => access(item, sortAccessor))

      if (sortType === 'desc') {
        _items.reverse()
      }
    }

    return (
      <section className="table-view section">
        <div className="heading-container">
          <div className="section-heading">{title}</div>
          <AtomInput
            autofocus
            value={filterValue}
            placeholderText="Filter..."
            onDidChange={this.onFilterChange.bind(this)}
          />
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
          <tbody>{_items.length
                  ? _items.map(renderRow)
                  : this.renderNoItem(noItem, colCount)}
          </tbody>
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
  noItem: React.PropTypes.string,
  colCount: React.PropTypes.number,
}

const getAccessors = headings =>
  flatten(headings.map(heading => heading.accessor).filter(Boolean))

const access = (item, accessor) =>
  (isFunction(accessor) ? accessor(item) : get(item, accessor))
