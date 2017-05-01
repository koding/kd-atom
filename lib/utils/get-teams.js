'use babel'

import kd from './kd-run'

export default function getTeams() {
  return kd('team list --json').then(result => JSON.parse(result.stdout))
}
