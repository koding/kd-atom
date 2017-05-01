'use babel'
/* globals atom */

export default function getKdPath(commands) {
  return atom.config.get('kd.kdBinaryPath') || 'kd'
}
