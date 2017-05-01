'use babel'

import debug from 'debug'
import storage from 'electron-json-storage'
import kd from 'kd.js'

const log = debug('storage:log')
const error = debug('storage:error')

const STORAGE_KEY = 'kd-serializer'

export default class Storage extends kd.Object {
  constructor(options = {}, data = null) {
    options.storageKey = options.storageKey || STORAGE_KEY
    options.deserializer = options.deserializer || `deserializer:${Date.now()}`
    super(options, data)
  }

  deserialize(state) {
    log('deserializing')
    if (state.deserializer === this.getOption('deserializer') && state.data) {
      log('given state already has data, storage not used', state)
      this.setData(state.data)
      return Promise.resolve(state.data)
    }

    return new Promise((resolve, reject) => {
      storage.get(this.getOption('storageKey'), (err, state) => {
        if (err) {
          error('error getting state from storage', err)
          return reject(err)
        }

        const { deserializer, data } = state

        if (deserializer !== this.getOption('deserializer')) {
          const message = 'trying to get state with wrong deserializer'
          error(message, deserializer)
          return reject(new Error(message))
        }

        this.setData(data)

        log('got state from storage', state)
        return resolve(data)
      })
    })
  }

  serialize(data) {
    const { deserializer, storageKey } = this.getOptions()
    const state = {
      deserializer,
      data: data || this.getData(),
    }

    log('serializing', state)
    storage.set(storageKey, state)

    return data
  }

  reset() {
    this.serialize({})
    log('storage cleared')
  }
}
