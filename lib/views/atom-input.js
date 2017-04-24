'use babel'
/* globals atom */

/**
* Copyright (c) 2015-present, Facebook, Inc.
* All rights reserved.
*
* This source code is licensed under the license found in the LICENSE file in
* the root directory of https://github.com/facebook/nuclide/ source tree.
*
*
*/

import classNames from 'classnames'

import { CompositeDisposable } from 'atom'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

/**
* An input field rendered as an <atom-text-editor mini />.
*/
export default class AtomInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: props.value == null ? props.initialValue : props.value
    }
  }

  componentDidMount () {
    const disposables = (this._disposables = new CompositeDisposable())

    // There does not appear to be any sort of infinite loop where calling
    // setState({value}) in response to onDidChange() causes another change
    // event.
    const textEditor = this.getTextEditor()
    const textEditorElement = this.getTextEditorElement()
    if (this.props.autofocus) {
      this.focus()
    }
    if (this.props.startSelected) {
      // For some reason, selectAll() has no effect if called right now.
      process.nextTick(() => {
        if (!textEditor.isDestroyed()) {
          textEditor.selectAll()
        }
      })
    }
    disposables.add(
      atom.commands.add(textEditorElement, {
        'core:confirm': () => {
          if (this.props.onConfirm != null) {
            this.props.onConfirm()
          }
        },
        'core:cancel': () => {
          if (this.props.onCancel != null) {
            this.props.onCancel()
          }
        },
      })
    )
    const placeholderText = this.props.placeholderText
    if (placeholderText != null) {
      textEditor.setPlaceholderText(placeholderText)
    }
    this.getTextEditorElement().setAttribute('tabindex', this.props.tabIndex)
    if (this.props.disabled) {
      this._updateDisabledState(true)
    }

    // Set the text editor's initial value and keep the cursor at the beginning
    // of the line. Cursor position was documented in a test and is retained
    // here after changes to how text is set in the text editor. (see
    // focus-related spec in AtomInput-spec.js)
    this.setText(this.state.value)
    this.getTextEditor().moveToBeginningOfLine()

    // Begin listening for changes only after initial value is set.
    disposables.add(
      textEditor.onDidChange(() => {
        this.setState({ value: textEditor.getText() })
        this.props.onDidChange.call(null, textEditor.getText())
      })
    )

    this._updateWidth()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.disabled !== this.props.disabled) {
      this._updateDisabledState(nextProps.disabled)
    }
    const { value, placeholderText } = nextProps
    if (typeof value === 'string' && value !== this.props.value) {
      // If the `value` prop is specified, then we must update the input area
      // when there is new text, and this includes maintaining the correct
      // cursor position.
      this.setState({ value })
      const editor = this.getTextEditor()
      const cursorPosition = editor.getCursorBufferPosition()
      this.setText(value)
      editor.setCursorBufferPosition(cursorPosition)
    }

    if (placeholderText !== this.props.placeholderText) {
      this.getTextEditor().setPlaceholderText(placeholderText || '')
    }
  }

  componentDidUpdate (prevProps, prevState) {
    this._updateWidth(prevProps.width)
  }

  componentWillUnmount () {
    // Note that destroy() is not part of TextEditor's public API.
    this.getTextEditor().destroy()

    if (this._disposables) {
      this._disposables.dispose()
      this._disposables = null
    }
  }

  _updateDisabledState (isDisabled) {
    // Hack to set TextEditor to read-only mode, per
    // https://github.com/atom/atom/issues/6880
    if (isDisabled) {
      this.getTextEditorElement().removeAttribute('tabindex')
    } else {
      this.getTextEditorElement().setAttribute('tabindex', this.props.tabIndex)
    }
  }

  render () {
    const { size, unstyled, onClick, onFocus, onBlur } = this.props

    const className = classNames(this.props.className, {
      'atom-text-editor-unstyled': unstyled,
      [`atom-text-editor-${String(size)}`]: size != null,
    })

    // Because the contents of `<atom-text-editor>` elements are managed by its
    // custom web component class when "Use Shadow DOM" is disabled, this
    // element should never have children. If an element has no children, React
    // guarantees it will never re-render the element (which would wipe out the
    // web component's work in this case).
    return (
      <atom-text-editor
        class={className}
        mini
        onClick={onClick}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    )
  }

  getText () {
    return this.state.value
  }

  setText (text) {
    this.getTextEditor().setText(text)
  }

  getTextEditor () {
    return this.getTextEditorElement().getModel()
  }

  onDidChange (callback) {
    return this.getTextEditor().onDidChange(callback)
  }

  getTextEditorElement () {
    /* eslint-disable */
    return ReactDOM.findDOMNode(this)
    /* eslint-enable */
  }

  _updateWidth (prevWidth) {
    if (this.props.width !== prevWidth) {
      const width = this.props.width == null ? undefined : this.props.width
      this.getTextEditorElement().setWidth(width)
    }
  }

  focus () {
    this.getTextEditor().moveToEndOfLine()
    this.getTextEditorElement().focus()
  }
}

AtomInput.defaultProps = {
  disabled: false,
  autofocus: false,
  startSelected: false,
  initialValue: '',
  tabIndex: '0', // Default to all <AtomInput /> components being in tab order
  width: 150,
  onClick: event => {},
  onDidChange: text => {},
  onFocus: () => {},
  onBlur: () => {},
  unstyled: false,
}

AtomInput.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string,
  initialValue: PropTypes.string,
  placeholderText: PropTypes.string,
  size: PropTypes.number,
  width: PropTypes.number,
  disabled: PropTypes.bool,
  autofocus: PropTypes.bool,
  startSelected: PropTypes.bool,
  tabIndex: PropTypes.string,
  onClick: PropTypes.func,
  onDidChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  unstyled: PropTypes.bool,
}
