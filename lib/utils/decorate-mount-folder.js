'use babel'
import { IconType } from '../constants'
import isMountedFolder from './is-mounted-folder'

export default function decorateMountFolder(root) {
  console.log(!!root, isMountedFolder(root))
  if (!root || !isMountedFolder(root)) {
    return null
  }
  root.classList.add('kd-mount')
  root.directoryName.classList.remove(IconType.Repo)
  root.directoryName.classList.remove(IconType.Directory)
  root.directoryName.classList.add(IconType.Mount)

  return root
}
