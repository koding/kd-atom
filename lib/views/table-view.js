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
      expanded: {},
    }
  }

  onFilterChange (filterValue) {
    this.setState({ filterValue })
  }

  getId (item) {
    return this.props.items.indexOf(item)
  }

  setExpandedState (item, expanded) {
    this.setState({
      ...this.state,
      expanded: {
        ...this.state.expanded,
        [this.getId(item)]: expanded,
      },
    })
  }

  expandAll () {
    this.setState({
      ...this.state,
      expanded: this.props.items.map(() => true),
    })
  }

  collapseAll () {
    this.setState({
      ...this.state,
      expanded: this.props.items.map(() => false),
    })
  }

  isExpanded (item) {
    return this.state.expanded[this.getId(item)]
  }

  isAllExpanded () {
    for (let item of this.props.items) {
      if (!this.state.expanded[this.getId(item)]) {
        return false
      }
    }
    return true
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

  shouldRenderExpansion (item) {
    const { expandable, renderExpansion } = this.props
    return expandable && isFunction(renderExpansion) && this.isExpanded(item)
  }

  renderRow (item, index) {
    const { renderRow, renderExpansion } = this.props

    const onExpand = this.setExpandedState.bind(this, item, true)
    const onCollapse = this.setExpandedState.bind(this, item, false)

    return [
      renderRow(item, index, this.isExpanded(item), onExpand, onCollapse),
      this.shouldRenderExpansion(item) ? renderExpansion(item, index) : null,
    ]
  }

  render () {
    const {
      title,
      compact,
      expandable,
      onReload,
      onClose,
      headings,
      items,
      noItem,
      colCount,
    } = this.props

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

    const className = cx('table-view section', {
      compact: !!compact
    })

    return (
      <section className={className}>
        {!compact &&
          <TableHeader
            title={title}
            filterValue={filterValue}
            expandable={expandable}
            allExpanded={this.isAllExpanded()}
            onFilterChange={this.onFilterChange.bind(this)}
            onClose={onClose}
            onReload={onReload}
            onExpandAll={this.expandAll.bind(this)}
            onCollapseAll={this.collapseAll.bind(this)}
          />}
        <table className="table text">
          <thead>
            <tr>
              {headings.map(this.renderHeading.bind(this))}
            </tr>
          </thead>
          <tbody>
            {_items.length
              ? _items.map(this.renderRow.bind(this))
              : this.renderNoItem(noItem, colCount)}
          </tbody>
        </table>
      </section>
    )
  }
}

TableView.propTypes = {
  title: React.PropTypes.string.isRequired,
  expandable: React.PropTypes.bool,
  compact: React.PropTypes.bool,
  onReload: React.PropTypes.func,
  onClose: React.PropTypes.func,
  headings: React.PropTypes.array,
  items: React.PropTypes.array,
  renderRow: React.PropTypes.func,
  renderExpansion: React.PropTypes.func,
  noItem: React.PropTypes.string,
  colCount: React.PropTypes.number,
}

const getAccessors = headings =>
  flatten(headings.map(heading => heading.accessor).filter(Boolean))

const access = (item, accessor) =>
  (isFunction(accessor) ? accessor(item) : get(item, accessor))

const TableHeader = ({
  title,
  filterValue,
  expandable,
  allExpanded,
  onFilterChange,
  onClose,
  onReload,
  onExpandAll,
  onCollapseAll,
}) => (
  <div className="heading-container">
    <div className="section-heading">{title}</div>
    <AtomInput
      autofocus
      value={filterValue}
      placeholderText="Filter..."
      onDidChange={onFilterChange}
    />
    {expandable &&
      <button
        className={`btn btn-sm icon icon-triangle-${allExpanded ? 'down' : 'right'}`}
        onClick={allExpanded ? onCollapseAll : onExpandAll}
        children={allExpanded ? 'Collapse All' : 'Expand All'}
      />}
    <button className="btn btn-sm icon icon-sync" onClick={onReload}>
      Reload
    </button>
    <button className="btn btn-sm icon icon-x" onClick={onClose}>
      Close
    </button>
  </div>
)

TableHeader.propTypes = {
  title: React.PropTypes.string,
  filterValue: React.PropTypes.string,
  expandable: React.PropTypes.bool,
  allExpanded: React.PropTypes.bool,
  onFilterChange: React.PropTypes.func,
  onReload: React.PropTypes.func,
  onClose: React.PropTypes.func,
  onExpandAll: React.PropTypes.func,
  onCollapseAll: React.PropTypes.func,
}
