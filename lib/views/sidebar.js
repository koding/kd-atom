'use babel';

const kd = require('kd.js');

export default class Sidebar extends kd.View {

  constructor(options = {}, data) {

    options.tagName = 'koding-sidebar';

    super(options, data);

  }

  partial() {
    return "this is sidebar"
  }

}
