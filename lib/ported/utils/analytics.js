'use babel';

import $ from 'jquery'

let request;

export default class Analytics {

  static initClass() {

    request = function(path, method, data) {

      let options = { method, data };
      return $.ajax(`/-/analytics/${path}`, options);
    };
  }


  static track(action, properties) {

    let data = { action, properties };
    return request('track', 'post', data);
  }


  static page(name, category) {

    let properties = {
      url      : window.location.toString(),
      path     : window.location.pathname,
      title    : window.document.title,
      referrer : window.document.referrer
    };

    let data = { name, category, properties };
    return request('page', 'post', data);
  }
}
Analytics.initClass();
