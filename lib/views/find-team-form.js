'use babel';

import kd from 'kd.js';
// import utils from './../core/utils';
import LoginViewInlineForm from '../ported/login-view-inline-form';
import LoginInputView from './../ported/login-input-view';
// import FindTeamHelper from './findteamhelper';

export default class FindTeamForm extends LoginViewInlineForm {

  constructor(options = {}, data) {

    options.cssClass = kd.utils.curry('login-form', options.cssClass);

    super(options, data);

    this.usernameOrEmail = new LoginInputView({
      inputOptions   : {
        name         : 'email',
        label        : 'Email address',
        placeholder  : 'Enter your email address',
        testPath     : 'find-team-input',
        validate     : {
          container  : this,
          rules      : { required : true },
          messages   : { required : 'Please enter your email.' }
        }
      }
    });

    this.button = new kd.ButtonView({
      title       : 'SEND TEAM LIST',
      style       : 'TeamsModal-button',
      type        : 'submit',
      loader      : true
    });

    this.recaptcha = new kd.CustomHTMLView({
      domId    : 'findTeamRecaptcha',
      cssClass : 'login-input-view'
    });

    this.recaptcha.hide();

    let callback = this.getCallback();

    this.setCallback(formData => {

      if (this.recaptchaId != null && !(grecaptcha && grecaptcha.getResponse(this.recaptchaId))) {
        this.button.hideLoader();
        return new kd.NotificationView
          cssClass : 'recoverConfirmation'
          title    : 'Please tell us that you\'re not a robot!'
      }

      formData.recaptcha = recaptchaResponse;
      return callback(formData);
    });
  }

  reloadRecaptcha() {

    // if (!FindTeamHelper.isRecaptchaRequired()) { return; }
    //
    // this.recaptcha.show();
    // if (this.recaptchaId != null) {
    //   return __guard__(grecaptcha, x => x.reset(this.recaptchaId));
    // } else {
    //   return utils.loadRecaptchaScript(() => {
    //     return this.recaptchaId = __guard__(grecaptcha, x1 => x1.render('findTeamRecaptcha', { sitekey : kd.config.recaptcha.key }));
    //   });
    // }
  }

  reset() {

    super.reset(...arguments);
    return this.button.hideLoader();
  }

  setFocus() { return this.usernameOrEmail.input.setFocus(); }

  pistachio() {

    return `
      {{> this.usernameOrEmail}}
      {{> this.recaptcha}}
      {{> this.button}}`;
  }

};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
