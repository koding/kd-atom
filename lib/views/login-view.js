'use babel'
/* globals atom */

import debug from 'debug'
import { Emitter, CompositeDisposable } from 'atom'
import { View, TextEditorView } from 'atom-space-pen-views'
import { logo } from '../../assets/svgs'

const log = debug('views:log')

class LoginView extends View {

  static content () {
    let description = 'Please log in to see your teams.'

    this.div(() => {
      this.div({ 'class': 'koding-login-view--logo' }, () => { this.raw(logo) })
      this.h2(description)
      this.form(() => {
        this.label('Username:')
        this.subview('username', new TextEditorView({ mini: true }))
        this.label('Password:')
        this.subview('password', new TextEditorView({ mini: true }))
        this.button({ class: 'btn cancel', type: 'button' }, 'Cancel')
        this.button({ class: 'btn btn-info pull-right submit', type: 'submit' }, 'LOGIN')
      })
      this.p({ class: 'register' }, () => {
        this.span('Don\'t have an account? ')
        this.a('Register here…')
      })
    })
  }

  setData (data = {}) {
    this.__data = data
    return data
  }

  getData () {
    return this.__data
  }

  initialize (data) {
    this.setData(data)
    this.emitter = new Emitter()
    this.disposables = new CompositeDisposable()
    this.bindViews()
  }

  attached () {
    log('attached')
    this.username.setText(this.getData().username || '')
  }

  bindViews () {
    this.find('button.cancel').click(button => {
      this.emitter.emit('modal-cancelled')
    })

    this.find('form').submit(this.submit.bind(this))

    this.disposables.add(atom.commands.add('form atom-text-editor', {
      'core:focus-next': () => {
        console.log('tab')
      },
      'core:confirm': () => {
        this.find('form').submit()
      }
    }))
  }

  submit (event) {
    event.preventDefault()
    event.stopPropagation()
    let username = this.username.getModel().getText()
    let password = this.password.getModel().getText()
    if (username && password) {
      this.emitter.emit('modal-submitted', {username, password})
    } else {
      atom.notifications.addWarning('Please fill all the inputs!')
    }
    return false
  }

}

export default LoginView
