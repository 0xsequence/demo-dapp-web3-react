import React, { useState } from 'react'

import logoUrl from './images/logo.svg'

import { ethers } from 'ethers'
import { sequence } from '0xsequence'

import { ERC_20_ABI } from './constants/abi'

import { configureLogger } from '@0xsequence/utils'
import { Group } from './components/Group'
import { styled, typography } from './style'
import { Button } from './components/Button'
import { hooks, sequence as sequenceConnector } from './connectors/sequence'

configureLogger({ logLevel: 'DEBUG' })

const App = () => {
  const { useChainId, useAccounts, useError, useIsActivating, useIsActive, useProvider, useENSNames } = hooks

  const provider = useProvider()
  const isActive = useIsActive()
  const chainId = useChainId()
  const accounts = useAccounts()
  const error = useError()
  const isActivating = useIsActivating()
  const ENSNames = useENSNames(provider)

  // console.log('provider', provider)
  // console.log('isActive', isActive)
  // console.log('chainId', chainId)
  // console.log('accounts', accounts)
  // console.log('error', error)
  // console.log('isActivating', isActivating)
  // console.log('ENSNames', ENSNames)

  const connectWeb3React = async () => {
    sequenceConnector.activate('polygon');
  }

  const disconnectWeb3React = async () => {
    sequenceConnector.deactivate();
  }

  const getChainID = async () => {
    const signer = provider!.getSigner()
    console.log('signer.getChainId()', await signer.getChainId())
  }

  const getAccounts = async () => {
    const signer = provider!.getSigner()
    console.log('getAddress():', await signer.getAddress())

    console.log('accounts:', await provider!.listAccounts())
  }

  const getBalance = async () => {
    const signer = provider!.getSigner()
    const account = await signer.getAddress()
    const balanceChk1 = await provider!.getBalance(account)
    console.log('balance check 1', balanceChk1.toString())

    const balanceChk2 = await signer.getBalance()
    console.log('balance check 2', balanceChk2.toString())
  }

  const getNetworks = async () => {
    console.log('networks:', await provider!.getNetwork())
  }

  const signMessage = async () => {
    const signer = await provider!.getSigner()

    const message = `Two roads diverged in a yellow wood,
Robert Frost poet

And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

I shall be telling this with a sigh
Somewhere ages and ages hence:
Two roads diverged in a wood, and I—
I took the one less traveled by,
And that has made all the difference.`

    // sign
    const sig = await signer.signMessage(message)
    console.log('signature:', sig)

    const isValid = await sequence.utils.isValidMessageSignature(await signer.getAddress(), message, sig, provider!)
    console.log('isValid?', isValid)
  }

  const signTypedData = async () => {
    const signer = provider!.getSigner()

    const typedData: sequence.utils.TypedData = {
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: await signer.getChainId(),
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
      },
      types: {
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' }
        ]
      },
      message: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
      }
    }

    const sig = await signer._signTypedData(typedData.domain, typedData.types, typedData.message)
    console.log('signature:', sig)

    const isValid = await sequence.utils.isValidTypedDataSignature(await signer.getAddress(), typedData, sig, provider!)
    console.log('isValid?', isValid)
  }

  const sendETH = async () => {
    const signer = provider!.getSigner() // select DefaultChain signer by default

    console.log(`Transfer txn on ${signer.getChainId()}`)

    const toAddress = ethers.Wallet.createRandom().address

    const tx1 = {
      gasLimit: '0x55555',
      to: toAddress,
      value: ethers.utils.parseEther('1.234'),
      data: '0x'
    }

    console.log(`balance of ${toAddress}, before:`, await provider!.getBalance(toAddress))

    const txnResp = await signer.sendTransaction(tx1)
    await txnResp.wait()

    console.log(`balance of ${toAddress}, after:`, await provider!.getBalance(toAddress))
  }

  const sendDAI = async () => {
    const signer = provider!.getSigner()

    const toAddress = ethers.Wallet.createRandom().address

    const amount = ethers.utils.parseUnits('5', 18)

    const daiContractAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' // (DAI address on Polygon)

    const tx = {
      gasLimit: '0x55555',
      to: daiContractAddress,
      value: 0,
      data: new ethers.utils.Interface(ERC_20_ABI).encodeFunctionData('transfer', [toAddress, amount.toHexString()])
    }

    const txnResp = await signer.sendTransaction(tx)
    await txnResp.wait()
  }

  const disableActions = !isActive

  return (
    <Container>
      <SequenceLogo alt="logo" src={logoUrl} />
      <Title>Demo Dapp + Web3-React</Title>
      <Description>Please open your browser dev inspector to view output of functions below</Description>

      <Group label="Connection" layout="grid">
        <Button onClick={() => connectWeb3React()}>Connect Web3-React</Button>
        <Button onClick={() => disconnectWeb3React()}>Disconnect</Button>
      </Group>
      <Group label="State" layout="grid">
        <Button disabled={disableActions} onClick={() => getChainID()}>
          ChainID
        </Button>
        <Button disabled={disableActions} onClick={() => getNetworks()}>
          Networks
        </Button>
        <Button disabled={disableActions} onClick={() => getAccounts()}>
          Get Accounts
        </Button>
        <Button disabled={disableActions} onClick={() => getBalance()}>
          Get Balance
        </Button>
      </Group>

      <Group label="Signing" layout="grid">
        <Button disabled={disableActions} onClick={() => signMessage()}>
          Sign Message
        </Button>
        <Button disabled={disableActions} onClick={() => signTypedData()}>
          Sign TypedData (EIP-712) Message
        </Button>
      </Group>

      <Group label="Transactions" layout="grid">
        <Button disabled={disableActions} onClick={() => sendETH()}>
          Send ETH
        </Button>
        <Button disabled={disableActions} onClick={() => sendDAI()}>
          Send DAI Tokens
        </Button>
      </Group>
    </Container>
  )
}

export default React.memo(App)

const Container = styled('div', {
  padding: '80px 25px 80px',
  margin: '0 auto',
  maxWidth: '720px'
})

const SequenceLogo = styled('img', {
  height: '40px'
})

const Title = styled('h1', typography.h1, {
  color: '$textPrimary',
  fontSize: '25px'
})

const Description = styled('p', typography.b1, {
  color: '$textSecondary',
  marginBottom: '15px'
})
