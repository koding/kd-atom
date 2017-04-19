'use babel'
/* globals atom */

import { Emitter } from 'atom'
import { View } from 'atom-space-pen-views'
import { logo } from '../../assets/svgs'

const descriptions = {
  NOT_INSTALLED: {
    title: '<code>kd</code> is missing',
    description: `
      Please open a terminal window and install it with the following commands
      and come back once done. (mac/linux only)
    `
  },
  NOT_LOGGEDIN: {
    title: 'Login/Register',
    description: `
      You are not logged in, please log in with the following commands and come
      back.
    `
  },
  DAEMON_NOT_INSTALLED: {
    title: 'Daemon is missing',
    description: `
      It seems like the <code>kd</code> binary is installed but its daemon is
      missing, please install it with the following command.
    `
  },
  DAEMON_STOPPED: {
    title: 'Daemon is not running',
    description: `
      <code>kd</code> daemon is not running please run it with the following
      command:
    `
  }
}

const helpers = {
  NOT_INSTALLED: [
    'rm -rf ~/.config/koding',
    'brew tap rjeczalik/kd',
    'brew install kd --devel',
    'sudo kd daemon install --team &lt;slug&gt; --baseurl https://koding.com'
  ],
  NOT_LOGGEDIN: [
    'kd auth login --team &lt;yourteam&gt;'
  ],
  DAEMON_NOT_INSTALLED: [
    'sudo kd daemon install --team &lt;yourteam&gt;'
  ],
  DAEMON_STOPPED: [
    'sudo kd daemon restart'
  ]
}

export default class KDHelpView extends View {

  static content (data = {}) {
    this.div(() => {
      if (!data.mini) {
        this.div({ class: 'kd-help-view--logo' }, () => { this.raw(logo) })
      }
      this.div({ outlet: 'content', click: 'click' })
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
    if (!prompt) { return }
    this.setContent(prompt)
  }

  setContent (prompt) {
    this.content.html('')
    let commandsHTML = ''
    if (helpers[prompt]) {
      for (let command of Array.from(helpers[prompt])) {
        commandsHTML += "<span class='icon icon-clippy clippy'></span>"
        commandsHTML += `<code class='clippy'>${command}</code>`
        commandsHTML += '<br>'
      }
    }
    this.content.append(`
      <h2>${descriptions[prompt].title}
      <span class='icon icon-x x pull-right'></span></h2>`)
    this.content.append(`<p>${descriptions[prompt].description}</p>`)
    if (commandsHTML) {
      this.content.append(`<pre>${commandsHTML}</pre>`)
    }
  }

  click (event) {
    if (event.target.classList.contains('icon-x')) {
      return this.emitter.emit('help-view-close-clicked')
    }
    if (event.target.classList.contains('clippy')) {
      return this.copyToClipboard(event)
    }
  }

  copyToClipboard (event) {
    let el, command

    if (event.target.tagName === 'SPAN') {
      el = event.target.nextSibling
    } else {
      el = event.target
    }

    command = el.textContent

    atom.clipboard.write(command)
    atom.notifications.add('info', 'Command copied to the clipboard!', {
      icon: 'clippy',
      description: `\`${command}\``
    })
  }

}
