'use babel'

import execa from 'execa'

export default function getTeams () {
  return execa('kd', ['team', 'list', '--json'])
    .then(result => JSON.parse(result.stdout))
}
