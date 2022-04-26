import { initializeConnector } from '@web3-react/core'
import { Sequence } from '@0xsequence/web3-react'

const options = {
  appName: 'Web3 React Demo app'
}

export const [sequence, hooks] = initializeConnector<Sequence>((actions) => 
  new Sequence(actions, false, options))
