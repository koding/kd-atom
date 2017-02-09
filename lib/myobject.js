'use babel'

export default class MyObject {

  constructor (data) {
    this.data = data
    return this
  }

  serialize () {
    this.data.count++

    return {
      deserializer: 'MyObject',
      data: this.data
    }
  }

}
