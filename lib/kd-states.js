'use babel'

import execa from 'execa'

const STATES = {
  NOT_INSTALLED: 'NOT_INSTALLED',
  DAEMON_NOT_INSTALLED: 'DAEMON_NOT_INSTALLED',
  DAEMON_STOPPED: 'DAEMON_STOPPED',
  NOT_LOGGEDIN: 'NOT_LOGGEDIN'
}

const checkers = {
  isKDInstalled: {
    state: 'NOT_INSTALLED',
    fn: execa.bind(this, 'which', ['kd'])
  },
  isDaemonInstalled: {
    state: 'DAEMON_NOT_INSTALLED',
    fn: execa.bind(this, 'kd', ['list'])
  },
  isDaemonStopped: {
    state: 'DAEMON_STOPPED',
    fn: execa.bind(this, 'kd', ['list'])
  },
  isLoggedIn: {
    state: 'NOT_LOGGEDIN',
    fn: execa.bind(this, 'kd', ['team', 'show'])
  }
}

function getCheckerFn (kdState) {
  let checkerFn
  for (let key in checkers) {
    let { state, fn } = checkers[key]
    if (kdState === state) { checkerFn = fn }
  }
  return checkerFn
}

export default {
  STATES,
  checkers,
  getCheckerFn
}

