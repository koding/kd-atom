'use babel'

import kd from './kd-run'

export default function getStacks () {
  return kd('stack list --json')
    .then(({ stdout }) => JSON.parse(stdout))
    .then(stacks => stacks.filter(stack => stack.title !== 'Managed VMs'))
}
