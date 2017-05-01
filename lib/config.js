'use babel'

export default {
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
