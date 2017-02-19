'use babel'

import rp from 'request-promise-native'

const PROTOCOL = 'https'
const API_PATH = 'koding.com/api/social/presence/ping'

let teamSlug = 'kd-io'
// let sessionCookie = 'c6b3f830-0645-4221-b4d7-865a57812958' // bad
let sessionCookie = '725cf9cd-ad58-436c-901b-869acfb96084' // good

function isLoggedIn () {
  let options = {
    uri: `${PROTOCOL}://${teamSlug}.${API_PATH}`,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `clientId=${sessionCookie}`
    },
    json: true
  }

  return rp(options)
}

function apiCall (path, body = {}) {
  let options = {
    uri: `${PROTOCOL}://${teamSlug}.koding.com/remote.api/${path}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionCookie}`
    },
    body: body,
    json: true
  }

  return rp.post(options)
}

function doLogin (username, password) {
  console.log(username, password)
  let options = {
    uri: `${PROTOCOL}://${teamSlug}.koding.com/Login`,
    form: { username, password },
    resolveWithFullResponse: true,
    headers: {
      'cache-control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  return rp.post(options)
}

export default {
  apiCall,
  isLoggedIn,
  doLogin
}
