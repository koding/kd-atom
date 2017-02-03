'use babel';

const kd = require('kd.js');

export default class LoginView extends kd.View {

  constructor(options = {}, data) {

    options.tagName = 'koding-login-view';

    super(options, data);

  }

  partial() {
    return "this is login view"
  }

}
