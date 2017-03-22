'use babel'

import { View } from 'atom-space-pen-views'

export default class LoadingView extends View {

  static content (message, icon = 'hourglass') {
    this.div({ class: `icon icon-${icon}` }, () => {
      this.raw(message)
    })
  }

}
