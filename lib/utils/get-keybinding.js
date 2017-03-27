'use babel'
/* globals atom */

import getPlatform from './get-platform'

export default function (command, all = false) {
  const commandPaletteKeyBindings = atom.keymaps.findKeyBindings({ command })
  let keybinding
  commandPaletteKeyBindings.forEach(binding => {
    let platform = binding.selector.split(',')[0].substring(1)
    if (getPlatform() === platform) {
      if (all) {
        keybinding = binding.keystrokes
      } else {
        keybinding = binding.keystrokeArray[0]
      }
    }
  })
  console.log(keybinding)
  return keybinding
}