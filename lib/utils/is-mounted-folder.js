'use babel'
/* globals atom */

export default function isMountedFolder(root) {
  let { mounts } = atom.packages.getPackageState('kd')
  let result = false

  for (let mount of mounts) {
    console.log(root.directory.path, mount.mount.path)
    if (root.directory.path === mount.mount.path) {
      result = true
      break
    }
  }

  return result
}
