'use babel'

export default function getMountPaths(mounts = []) {
  return mounts.map(mount => mount.mount.path)
}
