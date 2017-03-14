'use babel'

import execa from 'execa'

export default function () {
  return new Promise((resolve, reject) => {
    execa('kd', ['team', 'list', '--json'])
      .then(result => {
        let teams = JSON.parse(result.stdout)
        resolve(teams)
      }).catch(reject)
  })
}
