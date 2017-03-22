'use babel'

import { Emitter, CompositeDisposable } from 'atom'
import { View } from 'atom-space-pen-views'
import { logo } from '../../assets/svgs'

const descriptions = {
  NOT_INSTALLED: {
    title: '<code>kd</code> is missing',
    description: 'Please open a terminal window and install it with the following commands and come back once done.'
  },
  NOT_LOGGEDIN: {
    title: 'Login/Register',
    description: 'You are not logged in, please log in with the following commands and come back.'
  },
  DAEMON_NOT_INSTALLED: {
    title: 'Daemon is missing',
    description: 'It seems like the <code>kd</code> binary is installed but its daemon is missing, please install it with the following command.'
  },
  DAEMON_STOPPED: {
    title: 'Daemon is not running',
    description: '<code>kd</code> daemon is not running please run it with the following command:'
  },
  ALL_GOOD: {
    title: '<code>kd</code> is up & running',
    description: 'The daemon is running. You\'re logged in!'
  }
}

const success = {
  NOT_INSTALLED: 'kd is installed',
  NOT_LOGGEDIN: 'you are logged in',
  DAEMON_NOT_INSTALLED: 'kd daemon is installed',
  DAEMON_STOPPED: 'kd daemon is running'
}

const helpers = {
  NOT_INSTALLED: [
    'brew tap rjeczalik/kd',
    'brew install kd --devel',
    'sudo kd daemon install --team <yourteam>'
  ],
  NOT_LOGGEDIN: [
    'kd auth login --team <yourteam>'
  ],
  DAEMON_NOT_INSTALLED: [
    'sudo kd daemon install --team <yourteam>'
  ],
  DAEMON_STOPPED: [
    'sudo kd daemon restart'
  ]
}

export default class KDHelpView extends View {

  static content (data = {}) {
    this.div(() => {
      if (!data.mini) {
        this.div({ class: 'kd-login-view--logo' }, () => { this.raw(logo) })
      }
      this.div({ outlet: 'content' }, () => {
        this.raw("<div class='icon icon-hourglass'>checking <code>kd</code>…</div>")
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
    let { prompt, succeeded } = data
    this.setData(data)
    this.emitter = new Emitter()
    this.disposables = new CompositeDisposable()
    if (prompt) {
      this.setContent(prompt)
    }
    if (!prompt && succeeded.length) {
      succeeded.forEach(step => {
        this.appendContent(step)
      })
    }
  }

  setContent (prompt) {
    this.content.html('')
    let commandsHTML = ''
    if (helpers[prompt]) {
      for (let command of Array.from(helpers[prompt])) {
        commandsHTML += `<code>${command}</code><br>`
      }
    }
    this.content.append(`<h2>${descriptions[prompt].title}</h2>`)
    this.content.append(`<p>${descriptions[prompt].description}</p>`)
    if (commandsHTML) {
      this.content.append(`<pre>${commandsHTML}</pre>`)
    }
  }

  appendContent (step) {
    if (success[step]) {
      this.content.append(`<div class='icon icon-check'>${success[step]}</div>`)
    }
  }

}
