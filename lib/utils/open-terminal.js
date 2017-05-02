'use babel'
/* globals atom */

import debug from 'debug'
import { exec } from 'child_process'

const log = debug('kd:open-terminal:log')
const error = debug('kd:open-terminal:error')

export default function openTerminal({ command }) {
  const platform = require('os').platform()

  const app = atom.config.get('kd.terminalPath')

  if (platform === 'darwin') {
    const cmd = `
      osascript <<END
        tell application "${app}" to activate
        tell application "System Events"
          keystroke "n" using {command down}
          keystroke "${command}"
          key code 52
        end tell
      END
    `

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        error(err)
        return atom.notifications.addError(err.message, {
          stack: err.stack ? err.stack : null,
        })
      }
      log(stdout)
      error(stderr)
    })
  } else {
    const readable = platform === 'win32' ? 'Windows' : 'Linux'
    atom.notifications.addError(
      `Open terminal is not supported for: ${readable}`
    )
  }
}
