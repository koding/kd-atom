'use babel'

import execa from 'execa'

export default function getMachines (team) {
  return execa('kd', ['machine', 'list', '--json'])
    .then(result => {
      let machines = JSON.parse(result.stdout)
      if (team) {
        machines = machines.filter(machine => machine.team === team)
      }
      return machines.filter(machine => machine.status.state > 1)
    })
}
