'use babel'

import debug from 'debug'
import { Emitter, CompositeDisposable } from 'atom'
import { View } from 'atom-space-pen-views'
import { logo } from '../../assets/svgs'
import KD from '../kd-states'

const log = debug('views:log')
const error = debug('app:err')

const promptOrder = Object.keys(KD.STATES)
const DELAY = 2000

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
  }
}

const helpers = {
  NOT_INSTALLED: [
    'brew tap rjeczalik/kd',
    'brew install kd',
    'sudo kd daemon install --team yourteam'
  ],
  NOT_LOGGEDIN: [
    'kd auth login --baseurl https://koding.com --team [your-team-slug]'
  ],
  DAEMON_NOT_INSTALLED: [
    'sudo kd daemon install --team yourteam'
  ],
  DAEMON_STOPPED: [
    'sudo kd daemon restart'
  ]
}

export default class KDHelpView extends View {

  static content (data = {}) {
    this.div(() => {
      this.div({ class: 'koding-login-view--logo' }, () => { this.raw(logo) })
      this.div({ outlet: 'content' }, () => {
        this.raw("<div class='icon icon-hourglass'>Checking for <code>kd</code></div>")
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
    let { prompt } = data
    this.setData(data)
    this.emitter = new Emitter()
    this.disposables = new CompositeDisposable()
    this.bindViews()
    this.check(prompt)
  }

  setContent (prompt) {
    this.content.html('')
    let commandsHTML = ''
    for (let command of Array.from(helpers[prompt])) {
      commandsHTML += `<code>${command}</code><br>`
    }
    this.content.append(`<h2>${descriptions[prompt].title}</h2>`)
    this.content.append(`<p>${descriptions[prompt].description}</p>`)
    this.content.append(`<pre>${commandsHTML}</pre>`)
  }

  check (prompt) {
    if (!prompt) {
      log(prompt, 'no prompt')
      prompt = promptOrder[0]
    }

    let checker = KD.getCheckerFn(prompt)
    if (!checker) {
      log(prompt, 'no checker found')
      return null
    }

    checker().then(res => {
      log(prompt, 'all good')
      let nextPrompt = this.getNextPrompt(prompt)
      if (nextPrompt) {
        this.check(nextPrompt)
      } else {
        log('kd-is-in-good-shape')
        this.emitter.emit('kd-is-in-good-shape')
      }
    }).catch(err => {
      this.setContent(prompt)
      this.emitter.emit('kd-check-failed', prompt)
      error(err)
      log(prompt, 'checking again')
      setTimeout(this.check.bind(this, prompt), DELAY)
    })
  }

  getNextPrompt (prompt) {
    let index = promptOrder.indexOf(prompt)
    let next = null

    if (promptOrder[index + 1]) {
      next = promptOrder[index + 1]
    }
    return next
  }

  attached () {
    log('attached')
  }

  bindViews () {
    log('bindViews')
  }

}
