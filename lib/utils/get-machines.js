'use babel'

import execa from 'execa'

export default function (team) {
  return new Promise((resolve, reject) => {
    execa('kd', ['machine', 'list', '--json'])
      .then(result => {
        let machines = JSON.parse(result.stdout)
        if (team) {
          machines = machines.filter(machine => { return machine.team === team })
        }
        resolve(machines)
      }).catch(reject)
  })
}
