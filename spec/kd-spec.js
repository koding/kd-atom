'use babel'
/* globals describe expect it */

/* tests tbdl */

import KDController from '../lib/kd-controller'

describe('KDController', () => {
  it('has one valid test', () => {
    let controller = new KDController()
    expect(controller).toExist()
  })
})
