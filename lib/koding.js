'use babel';

import KodingView from './koding-view';
import { CompositeDisposable } from 'atom';
import rp from 'request-promise-native';

const PROTOCOL = 'https';
const API_PATH = 'koding.com/api/social/presence/ping';

let teamSlug = 'kd-io';
// let sessionCookie = 'c6b3f830-0645-4221-b4d7-865a57812958'; // bad
let sessionCookie = '725cf9cd-ad58-436c-901b-869acfb96084'; // good


async function isLoggedIn () {

  let options = {
    uri: `${PROTOCOL}://${teamSlug}.${API_PATH}`,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `clientId=${sessionCookie}`
    },
    json: true // Automatically parses the JSON string in the response
  };

  return rp(options);
}

async function apiCall (path, body = {}) {

  let options = {
    uri: `${PROTOCOL}://${teamSlug}.koding.com/remote.api/${path}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionCookie}`
    },
    body: body,
    json: true // Automatically parses the JSON string in the response
  };

  return rp.post(options);
}

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
