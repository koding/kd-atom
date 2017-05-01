'use babel'

import Storage from '../models/storage'

export default {
  storages: {},
  make(deserializer) {
    if (this.storages[deserializer]) {
      return this.storages[deserializer]
    }

    const storage = new Storage({ deserializer })
    this.storages[deserializer] = storage

    return storage
  },
}
