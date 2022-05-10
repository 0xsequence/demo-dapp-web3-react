import { SequenceConnector } from '@0xsequence/web3-react-v6'

const options = {
  appName: 'Web3 React Demo app'
}

export const sequence = new SequenceConnector({ chainId: 137, appName: options.appName  })
