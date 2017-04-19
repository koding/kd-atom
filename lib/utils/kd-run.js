'use babel'

import execa from 'execa'
import getKdPath from './get-kd-path'

const kdPath = getKdPath()

export default function runKd (commands) {
  if (!Array.isArray(commands)) {
    commands = commands.split(' ')
  }
  return execa(kdPath, commands)
}
