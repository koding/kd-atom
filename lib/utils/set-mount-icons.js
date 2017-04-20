'use babel'

import getMountIconSelector from './get-mount-icon-selector'
import { IconType } from '../constants'

export default function setMountIcons (mounts = []) {
  mounts.forEach(mount => {
    const el = document.querySelector(getMountIconSelector(mount))

    if (!el || el.classList.contains(IconType.Mount)) { return }

    el.classList.remove(IconType.Repo)
    el.classList.remove(IconType.Directory)
    el.classList.add(IconType.Mount)
  })
}
