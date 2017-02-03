'use babel';

import kd from 'kd.js';
import $ from 'jquery';
import analytics from '../ported/utils/analytics';
import JView from '../ported/jview';
import FindTeamForm from './find-team-form';
// import FindTeamHelper from './findteamhelper';

const EMPTY_TEAM_LIST_ERROR = 'Empty team list';
const SOLO_USER_ERROR       = 'Solo user detected';
const FAREWELL_SOLO_URL     = 'https://www.koding.com/farewell-solo';

const track = function(action, properties = {}) {
  properties.category = 'Teams';
  properties.label    = 'FindTeam';
  return analytics.track(action, properties);
};

export default class FindTeamView extends kd.TabPaneView {

  static initClass() {
    JView.mixin(this.prototype);
  }

  constructor(options = {}, data) {

    options.tagName = 'koding-team-selector'
    options.cssClass = kd.utils.curry('Team', options.cssClass);

    super(options, data);

    this.form = new FindTeamForm({
      callback : this.bound('findTeam')});

    this.back        = new kd.CustomHTMLView({
      tagName    : 'a',
      cssClass   : 'TeamsModal-button-link',
      partial    : 'BACK',
      attributes : { href : '/Teams' }});

    this.createTeam  = new kd.CustomHTMLView({
      tagName    : 'a',
      partial    : 'create a new team',
      attributes : { href : '/Teams/Create' }});

    this.on('PaneDidShow', () => this.form.reloadRecaptcha());
  }


  setFocus() { return this.form.setFocus(); }


  findTeam(formData) {

    track('submitted find teams form');
    console.log('submitted find teams form');

    // return FindTeamHelper.submitRequest(formData, {
    //   error   : xhr => {
    //     let { responseText } = xhr;
    //     this.handleServerError(responseText);
    //     return this.form.button.hideLoader();
    //   },
    //   success : () => {
    //     this.form.button.hideLoader();
    //     this.form.reset();
    //
    //     this.showNotification('Check your email', 'We\'ve sent you a list of your teams.');
    //
    //     return kd.singletons.router.handleRoute('/');
    //   }
    // });
  }


  handleServerError(err) {

    if (err === SOLO_USER_ERROR) { return location.assign(FAREWELL_SOLO_URL); }

    if (err === EMPTY_TEAM_LIST_ERROR) { err = 'We couldn\'t find any teams that you have joined or was invited!'; }
    return this.showNotification(err);
  }


  showNotification(title, content) {

    return new kd.NotificationView({
      cssClass : 'recoverConfirmation',
      title,
      content,
      duration : 4500
    });
  }


  pistachio() {

    return `<div class="TeamsModal TeamsModal--findTeam">
              <h4>Find My Teams</h4>
              <h5>We will email you the list of teams you are part of.</h5>
              {{> this.form}}
              {{> this.back}}
            </div>
            <div class="additional-info">
              Do you want to {{> this.createTeam}}?
            </div>
            <div class="ufo-bg"></div>
            <div class="ground-bg"></div>
            <div class="footer-bg"></div>`;

  }
};

FindTeamView.initClass();
