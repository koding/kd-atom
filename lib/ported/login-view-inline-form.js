'use babel';

import _ from 'lodash';
import kd from 'kd.js';
import JView from './jview';


export default class LoginViewInlineForm extends kd.FormView {

  static initClass() { JView.mixin(this.prototype); }

  viewAppended() {

    this.setTemplate(this.pistachio());
    this.template.update();

    this.on('FormValidationFailed', this.button.bound('hideLoader'));

    let inputs = kd.FormView.findChildInputs(this);

    // Reset the validations
    // return kd.singletons.router.on('RouteInfoHandled', () =>
    //   _.each(inputs, input => input.emit('ValidationFeedbackCleared'))
    // );
  }

  pistachio() {}

};

LoginViewInlineForm.initClass();
