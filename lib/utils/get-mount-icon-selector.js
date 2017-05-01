'use babel'

export default function getMountIconSelector(mount) {
  return `.tree-view [data-path="${mount.mount.path}"]`
}
