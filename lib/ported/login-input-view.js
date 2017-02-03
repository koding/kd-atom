'use babel';

import kd from 'kd.js';
import JView from './jview';

export default class LoginInputView extends JView {

  constructor(options = {}, data) {

    let { inputOptions } = options;
    options.cssClass     = kd.utils.curry('login-input-view', options.cssClass);

    if (!inputOptions) { inputOptions = {}; }

    inputOptions.cssClass           = kd.utils.curry('thin medium', inputOptions.cssClass);
    inputOptions.decorateValidation = false;

    let { placeholder, validate, label } = inputOptions;

    delete inputOptions.label;
    delete options.inputOptions;

    if (validate) { validate.notifications = false; }

    super(options, null);

    this.input       = new kd.InputView(inputOptions, data);
    this.placeholder = new kd.CustomHTMLView({
      tagName    : 'label',
      cssClass   : 'placeholder-helper',
      partial    : label || inputOptions
    });

    this.errors       = {};
    this.errorMessage = '';

    this.input.on('ValidationError',           this.bound('decorateValidation'));
    this.input.on('ValidationPassed',          this.bound('decorateValidation'));
    this.input.on('ValidationFeedbackCleared', this.bound('decorateValidation'));

    this.on('click', this.bound('setFocus'));
  }


  setFocus() { return this.input.setFocus(); }


  resetDecoration() { return this.unsetClass('validation-error validation-passed'); }


  decorateValidation(err) {

    this.resetDecoration();

    let { stickyTooltip } = this.getOptions();

    if (err) {
      this.setTooltip({
        cssClass  : 'validation-error',
        title     : `<p>${err}</p>`,
        direction : 'left',
        sticky    : stickyTooltip ? true : undefined,
        permanent : stickyTooltip ? true : undefined,
        offset    : {
          top     : 0,
          left    : 0
        }
      });
      this.tooltip.show();

    } else {
      this.unsetTooltip();
    }

    return this.setClass(err ? 'validation-error' : 'validation-passed');
  }


  pistachio() { return '{{> this.input}}{{> this.placeholder}}'; }
};
