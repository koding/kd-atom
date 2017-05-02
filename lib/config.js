'use babel'

const platform = require('os').platform()

let config = {
  localBasePath: {
    type: 'string',
    description: 'Local base path for mounting machines',
    default: `${require('os').homedir()}/koding`,
  },
  kdBinaryPath: {
    type: 'string',
    description: `If you have installed <code>kd</code>
                  somewhere other than the default installation path,
                  you can enter the installation path here.`,
    default: '/usr/local/bin/kd',
  },
}

// right now we only support OS X.
if (platform === 'darwin') {
  config.terminalPath = {
    type: 'string',
    description: 'Default terminal app to open. e.g (Terminal, iTerm)',
    default: 'Terminal',
  }
}

export default config
