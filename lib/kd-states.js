'use babel'

import execa from 'execa'
import debug from 'debug'
import { Emitter } from 'atom'
import getKdPath from './utils/get-kd-path'

const log = debug('kd-state:log')
const error = debug('kd-state:err')
const kdPath = getKdPath()

const STATES = {
  NOT_INSTALLED: 'NOT_INSTALLED',
  DAEMON_NOT_INSTALLED: 'DAEMON_NOT_INSTALLED',
  NOT_LOGGEDIN: 'NOT_LOGGEDIN',
}

const checkers = {
  isKDInstalled: {
    state: 'NOT_INSTALLED',
    fn: execa.bind(this, 'which', [kdPath]),
  },
  isDaemonInstalled: {
    state: 'DAEMON_NOT_INSTALLED',
    fn: execa.bind(this, kdPath, ['status']),
  },
  isLoggedIn: {
    state: 'NOT_LOGGEDIN',
    fn: execa.bind(this, kdPath, ['team', 'show']),
  },
}

const promptOrder = Object.keys(STATES)
const DELAY = 1000
const INITIAL_DELAY = 5000

const emitter = new Emitter()

function check(prompt) {
  if (!prompt) {
    log(prompt, 'no prompt')
    prompt = promptOrder[0]
  }

  let checker = getCheckerFn(prompt)
  if (!checker) {
    log(prompt, 'no checker found')
    return null
  }

  checker()
    .then(res => {
      log(prompt, 'all good')
      emitter.emit('kd-state-success', prompt)
      let nextPrompt = getNextPrompt(prompt)
      if (nextPrompt) {
        check(nextPrompt)
      } else {
        log('kd-is-in-good-shape')
        emitter.emit('kd-state-all-good')
        emitter.emit('ready')
      }
    })
    .catch(err => {
      emitter.emit('kd-state', prompt)
      error(err)
      log(prompt, 'checking again')
      setTimeout(check.bind(this, prompt), DELAY)
    })
}

function getNextPrompt(prompt) {
  let index = promptOrder.indexOf(prompt)
  let next = null

  if (promptOrder[index + 1]) {
    next = promptOrder[index + 1]
  }
  return next
}

function getCheckerFn(kdState) {
  let checkerFn
  for (let key in checkers) {
    let { state, fn } = checkers[key]
    if (kdState === state) {
      checkerFn = fn
    }
  }
  return checkerFn
}

function init() {
  /* this timeout is for some reason necessary
     otherwise we get an ENOENT error */
  setTimeout(() => {
    check(promptOrder[0])
  }, INITIAL_DELAY)
}

export default {
  init,
  STATES,
  checkers,
  getCheckerFn,
  emitter,
  check,
}
