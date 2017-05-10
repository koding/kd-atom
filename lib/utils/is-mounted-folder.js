'use babel'
/* globals atom */

export default function isMountedFolder(root) {
  let { mounts } = atom.packages.getPackageState('kd')
  let result = false

  for (let mount of mounts) {
    if (root.directory.path === mount.mount.path) {
      result = true
      break
    }
  }

  return result
}
