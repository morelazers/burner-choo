module.exports = store

const ethers = require('ethers')

const abi = require('../contracts/FLEXBUXX.abi')

const DEFAULT_STATE = {
  qr: null,
  ethBalance: Number(-1),
  tokenContract: null,
  tokenBalance: 0,
  address: "0x0000000000000000000000000000000000000000",
  burner: {
    signingKey: {
      privateKey: "0x0000000000000000000000000000000000000000"
    },
  },
  nextTx: {
    beforeParams: `You're sending`,
    price: '0',
    joiningStatement: '',
    param: '',
    afterParams: ``,
    cta: `Swipe to confirm`
  },
  afterConfirm: () => {},
  afterSend: () => {},
  refreshFuncs: []
}

async function store (state, emitter) {
  state.wallet = Object.assign({}, DEFAULT_STATE)
  state.wallet.burner = getWallet(state.provider)
  state.wallet.address = state.wallet.burner.signingKey.address // for convenience
  requestEth() // @todo this is hardcoded, remove later

  // -- PARITY-based nodes
  state.web3.eth.personal.newParityAccount(state.wallet.burner.signingKey.privateKey, 'have_fun_kids')

  // -- GETH-based nodes (how annoying is this)
  // some other web3 call goes here

  state.wallet.refresh = () => {
    for (let refreshFunc of state.wallet.refreshFuncs) {
      refreshFunc()
    }
  }

  // @todo - rewrite this to use web3 and get rid of the ethers.js stuff
  state.wallet.tokenContract = new state.web3.eth.Contract(abi, state.TOKEN_ADDRESS)
  state.wallet.tokenContractEthers = new ethers.Contract(state.TOKEN_ADDRESS, abi, state.provider)
  state.wallet.tokenContractEthers = state.wallet.tokenContractEthers.connect(state.wallet.burner)
  state.wallet.tokenContractEthers.on(state.wallet.tokenContractEthers.filters.Transfer(null, null), (f, t, v) => {
    if (t.toLowerCase() === state.wallet.address.toLowerCase()) {
      state.assist.notify('txConfirmedClient', () => `Received ${state.CURRENCY_SYMBOL}${v.toNumber().toLocaleString()}!`)
      state.wallet.refresh()
    } else if (f.toLowerCase === state.wallet.address.toLowerCase()) {
      state.wallet.refresh()
    }
  })
  setTokenBalance()

  // a whole bunch of events for you to configure the 'confirm' screen in the
  // wallet. YOU DON'T HAVE TO USE THE CONFIRM SCREEN, this is just a handy little
  // set of helpers if you do
  // @todo show how it looks when you set all these things
  emitter.on('nextTx.setBeforeParams', (s) => state.wallet.nextTx.beforeParams = s)
  emitter.on('nextTx.setPrice', (s) => state.wallet.nextTx.price = s)
  emitter.on('nextTx.setJoiningStatement', (s) => state.wallet.nextTx.joiningStatement = s)
  emitter.on('nextTx.setParam', (s) => state.wallet.nextTx.param = s)
  emitter.on('nextTx.setAfterParams', (s) => state.wallet.nextTx.afterParams = s)
  emitter.on('nextTx.setCta', (s) => state.wallet.nextTx.cta = s)
  emitter.on('nextTx.confirm', () => state.wallet.afterConfirm())
  emitter.on('nextTx.sent', () => state.wallet.afterSend())

  // send the wallet's tokens (this is hardcoded to an ERC223 at the moment)
  // we should probably make it a bit better and able to be configured
  // for example i think we should probably set:
  // state.wallet.tokens[token.address] = state.assist.Contract(token.contract)
  // this would allow us to send the token from anywhere in the wallet that we
  // had access to the address of the token
  emitter.on('wallet.sendTokens', async (t, v, b = "0x", m) => {
    const hash = sendTokenTransaction(t, v, b, m)
    emitter.emit('nextTx.sent')
  })

  state.wallet.refreshFuncs.push(setTokenBalance)

  // for some reason this does not work
  emitter.on('DOMContentLoaded', function() {
    console.log('--DOM LOADED--')
    // @todo here i should get the balance of the user in ETH (or xDAI) and if
    // it's greater than 0 then we should notify them that they're good to go
  })

  // function which gets the balance of the user in a token (currently hardcoded)
  // then renders an update
  async function setTokenBalance () {
    try {
      state.wallet.tokenBalance = await getTokenBalance(state.wallet.tokenContractEthers, state.wallet.address)
      emitter.emit('render')
    } catch (e) {
      console.log(e)
    }
  }

  // sends a token transaction (currently hardcoded to a single wallet token)
  // uses the standard token tx messages unless you pass in something as messages
  async function sendTokenTransaction (to, value, bytes = '0x', messages = {}) {
    const txMessages = Object.assign(getDefaultTokenMessages(value), messages)
    console.log('Unlocking account')
    await unlockAccount()
    console.log('Account unlocked, wrapping contract')
    const c = state.assist.Contract(state.wallet.tokenContract)
    const nonce = await state.web3.eth.getTransactionCount(state.wallet.address)
    console.log(`Account nonce: ${nonce}`)
    console.log(`Sending ${value} tokens to ${to}`)
    return c.methods['transfer(address,uint256,bytes)'](to, value, bytes).send({
      from: state.wallet.address,
      gasPrice: ethers.utils.parseUnits('1', 'gwei'),
      gas: '500000',
      nonce: nonce
    }, {
      messages: txMessages
    })
  }

  // unlocks the account for a single transaction
  async function unlockAccount() {
    return state.web3.eth.personal.unlockAccount(state.wallet.address, 'have_fun_kids', null)
  }

  // gets the default token sending messages (should allow tokens to set a
  // symbol or something like that)
  function getDefaultTokenMessages(value) {
    return {
      txSent: () => `Sending ${state.CURRENCY_SYMBOL}${value.toLocaleString()}`,
      txConfirmed: () => `Sent ${state.CURRENCY_SYMBOL}${value.toLocaleString()}`,
      txStall: () => `Something's wrong...`,
      txConfirmedClient: () => `Sent ${state.CURRENCY_SYMBOL}${value.toLocaleString()}`
    }
  }

  async function requestEth () {
    state.wallet.ethBalance = ethers.utils.formatEther(await state.provider.getBalance(state.wallet.address))
    console.log(state.wallet.ethBalance)
    if (state.wallet.ethBalance === '0.0') {
      fetch(`https://us-central1-stone-botany-238814.cloudfunctions.net/givememoney?address=${state.wallet.address}`, {
        mode: 'no-cors'
      }).then((e, res) => {
        // state.assist.notify('txConfirmedClient', () => `Setting you up`)
        console.log(e, res)
        return res
      }).then((e, something) => {

      })
    } else {
      state.assist.notify('txConfirmedClient', () => `You're good to go`)
    }
  }

}

// gets the balance of a given user on a given token contract
async function getTokenBalance (contract, address) {
  try {
    console.log('-- GETTING BALANCE --')
    const b = await contract.balanceOf(address)
    console.log(`-- BALANCE: ${b} --`)
    return b.toNumber()
  } catch (e) {
    console.log(e)
    return -1
  }
}

// gets the burner wallet from localstorage or else creates a new one
function getWallet (provider) {
  let w = localStorage.getItem('wallet')
  if (w) {
    w = new ethers.Wallet(JSON.parse(w).signingKey.privateKey, provider)
  } else  {
    w = ethers.Wallet.createRandom()
    localStorage.setItem('wallet', JSON.stringify(w))
  }
  console.log({w})
  return w
}