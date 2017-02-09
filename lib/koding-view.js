'use babel';

const kd = require('kd.js');
const TeamSelector = require('./views/team-selector');

export default class KodingView {

  constructor(serializedState) {

    console.log(serializedState);

    this.data = serializedState;

    const teamSelector = new TeamSelector;

    this.mainView = teamSelector;

    this.element = teamSelector.getElement();

  }

  destroy() {
    // allow GC to clean kd.js allocated memory
    this.mainView.destroy();
  }

  getElement() {
    return this.element;
  }

}
