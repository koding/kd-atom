'use babel';

import KodingView from './koding-view';
import { CompositeDisposable } from 'atom';

export default koding = {

  subscriptions: null,
  kodingView: null,
  loggedIn: null,

  activate(state) {
    console.log('koding activated!');
    this.subscriptions = new CompositeDisposable();

    if (state.kodingViewState){
      this.kodingView = atom.deserializers.deserialize(state.kodingViewState)
    } else {
      this.kodingView = new KodingView(state.kodingViewState);
    }

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'koding:init': () => this.init(),
      'koding:kill': () => this.kill(),
      'koding:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.kodingView.destroy();
  },

  serialize() {
    return {
      kodingViewState: this.kodingView.serialize()
    };
  },

  async init() {

    await isLoggedIn().then(res => {
      this.loggedIn = true;
      this.checkTeams();
    }).catch(err => {
      this.loggedIn = false;
      this.showLogin();
    });

    return this.loggedIn;
  },

  kill() {
    console.log('kill');
    this.deactivate();
  },

  toggle() {
    return console.log('toggle');
  },

  async checkTeams() {
    console.log('checkTeams');
    let account = await apiCall('JUser.whoami');
    let teams = await apiCall(`JAccount.fetchGroups/${account.data._id}`);

    console.log(account.data._id, teams);
    // JUser.whoami
    // JAccount.fetchGroups

  },

  showLogin() {
    console.log('showLogin');
  },

  consumeStatusBar() {
    this.activate()
  }

};
