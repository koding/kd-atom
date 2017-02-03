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

  serialize() {
    // this is required for kd.js to understand that the mainView is in DOM
    kd.utils.defer( () => this.mainView.emit('viewAppended') );

    return {
      deserializer: 'KodingView',
      data: this.data
    }
  }

  deserialize(config) {
    new KodingView(config);
  }

  destroy() {
    this.element.remove();
    // allow GC to clean kd.js allocated memory
    this.mainView.destroy();
  }

  getElement() {
    return this.element;
  }

}

atom.deserializers.add(KodingView);
