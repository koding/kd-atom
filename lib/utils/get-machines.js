'use babel'

import kd from './kd-run'

export default function getMachines(team) {
  return kd('machine list --json').then(result => {
    let machines = JSON.parse(result.stdout)
    if (team) {
      machines = machines.filter(machine => machine.team === team)
    }
    return machines
  })
}
