'use babel'

import kd from './kd-run'

export default function getMounts () {
  return kd('machine mount list --json')
    .then(result => {
      let mountsObj = JSON.parse(result.stdout)
      let mounts = []
      for (let label in mountsObj) {
        let machineMounts = mountsObj[label]
        machineMounts.forEach(mount => {
          mount.label = label
          mounts.push(mount)
        })
      }
      return mounts
    })
}
