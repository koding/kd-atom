'use babel'

import rp from 'request-promise-native'
import Cookies from 'set-cookie-parser'

const PROTOCOL = 'https'

let teamSlug = 'kd-io'
let sessionCookie = null

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

function getClientIdFromHeaders (rawCookies) {
  let clientId = null
  let cookies = Cookies.parse(rawCookies)
  cookies.forEach(cookie => {
    if (cookie.name === 'clientId') {
      clientId = cookie.value
    }
  })
  return clientId
}

function setSessionCookie (clientId) {
  sessionCookie = clientId
}

export default {
  apiCall,
  doLogin,
  getClientIdFromHeaders,
  setSessionCookie
}
