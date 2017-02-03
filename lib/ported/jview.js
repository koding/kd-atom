'use babel';

import kd from 'kd.js';
import Pistachio from './utils/pistachio';

export default class JView extends kd.View {

  static mixin(target) {
    target.viewAppended = this.prototype.viewAppended;
    return target.setTemplate = this.prototype.setTemplate;
  }

  viewAppended() {
    let template = this.getOptions().pistachio || this.pistachio;
    if ('function' === typeof template) { template = template.call(this); }

    if (template != null) {
      this.setTemplate(template);
      return this.template.update();
    }
  }

  setTemplate(tmpl, params) {
    if (params == null) { params = __guard__(this.getOptions(), x => x.pistachioParams); }
    let options = (params != null) ? { params } : undefined;
    this.template = new Pistachio(this, tmpl, options);
    this.updatePartial(this.template.html);
    return this.template.embedSubViews();
  }

  pistachio(tmpl) {
    if (tmpl) { return `${this.options.prefix}${tmpl}${this.options.suffix}`; }
  }
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
