'use babel'
/* globals atom */

import kd from 'kd.js'

const DEFAULT_TITLE = 'Notification'

const Types = {
  Info: 'addInfo',
  Error: 'addFatalError',
  Success: 'addSuccess'
}

export default class NotificationController extends kd.Object {
  constructor(options = {}) {
    super(options)

    this.notification = null
  }

  show(options = {}) {
    const {
      type = Types.Info,
      title = DEFAULT_TITLE,
      message,
      icon,
      duration,
      stack
    } = options

    if (this.notification) {
      this.dismiss()
    }

    this.notification = atom.notifications[type](title, {
      description: message,
      dismissable: true,
      icon: icon,
      stack: stack ? stack : undefined
    })

    if (duration) {
      setTimeout(this.bound('dismiss'), duration)
    }

    return this.notification
  }

  dismiss() {
    if (!this.notification) return

    this.notification.dismiss()
    this.notification = null
  }

  info(options) {
    this.show({ type: Types.Info, title: 'Info', ...options })
  }

  error(options) {
    this.show({ type: Types.Error, title: 'Error', ...options })
  }

  success(options) {
    this.show({ type: Types.Success, title: 'Success', ...options })
  }
}
