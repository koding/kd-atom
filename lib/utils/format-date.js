'use babel'

import moment from 'moment'

const formats = {
  sameDay: '[Today] hh:mm:ss',
  lastDay: '[Yesterday] hh:mm:ss',
  lastWeek: '[Last] dddd',
  sameElse: 'MMM Do, YYYY',
}

export default function formatDate (date) {
  return moment(date).calendar(null, formats)
}
