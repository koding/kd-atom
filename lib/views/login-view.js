'use babel'

import {Emitter} from 'atom'
import { View, TextEditorView } from 'atom-space-pen-views'
import { logo } from '../../assets/svgs'

class LoginView extends View {

  static content () {
    // let title = 'Login to Koding:'
    let description = 'Please log in to see your teams.'

    this.div(() => {
      this.div({ 'class': 'koding-login-view--logo' }, () => { this.raw(logo) })
      // this.h1(title)
      this.h2(description)
      this.form(() => {
        this.label('Username:')
        this.subview('username', new TextEditorView({ mini: true }))
        this.label('Password:')
        this.subview('password', new TextEditorView({ mini: true }))
        this.button({ class: 'btn cancel' }, 'Cancel')
        this.button({ class: 'btn btn-info pull-right submit', type: 'submit' }, 'LOGIN')
      })
      this.p({ class: 'register' }, () => {
        this.span('Don\'t have an account? ')
        this.a('Register here…')
      })
    })
  }

  initialize () {
    this.emitter = new Emitter()
    this.bindButtons()
  }

  bindButtons () {
    this.find('button.submit').click(button => {
      this.emitter.emit('modal-submitted')
    })
    this.find('button.cancel').click(button => {
      this.emitter.emit('modal-cancelled')
    })
  }

}

export default LoginView
