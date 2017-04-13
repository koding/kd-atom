'use babel'

import { remote } from 'electron'
import { install as atomPackageDepsInstall } from 'atom-package-deps'

export default function checkAtomDeps () {
  // Workaround for restoring multiple Atom windows. This prevents having all
  // the windows trying to install the deps at the same time - often
  // clobbering each other's install.
  const firstWindowId = remote.BrowserWindow.getAllWindows()[0].id
  const currentWindowId = remote.getCurrentWindow().id
  if (firstWindowId === currentWindowId) {
    atomPackageDepsInstall('kd')
  }
}
